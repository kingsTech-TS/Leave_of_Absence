import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJWT } from "@/lib/core-user";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");

  const CORE_API_URL =
    process.env.CORE_API_URL || "https://eksucore.vercel.app";
  const CORE_SYSTEM_SECRET = process.env.CORE_SYSTEM_SECRET;

  if (!ref) {
    return NextResponse.redirect(
      `${CORE_API_URL}/login?error=missing_reference`
    );
  }

  if (!CORE_API_URL || !CORE_SYSTEM_SECRET) {
    console.error("Missing CORE_API_URL or CORE_SYSTEM_SECRET.");
    return NextResponse.redirect(
      `${CORE_API_URL}/login?error=system_config_error`
    );
  }

  try {
    // 🔹 Verify session with Core Platform
    const verificationResponse = await fetch(
      `${CORE_API_URL}/api/verify-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: ref,
          secret: CORE_SYSTEM_SECRET,
        }),
      }
    );

    if (!verificationResponse.ok) {
      const errData = await verificationResponse.json().catch(() => ({}));
      console.error("[Callback] Verification failed:", errData);
      return NextResponse.redirect(
        `${CORE_API_URL}/login?error=verification_failed`
      );
    }

    const responseData = await verificationResponse.json();
    const { token } = responseData;

    if (!token) {
      console.error("[Callback] No token returned from verify-session.");
      return NextResponse.redirect(
        `${CORE_API_URL}/login?error=no_token_from_core`
      );
    }

    // 🔹 Decode JWT to get user details (using shared utility)
    const decodedPayload = decodeJWT(token);
    if (!decodedPayload) {
      console.error("[Callback] Could not decode token.");
      return NextResponse.redirect(`${CORE_API_URL}/login?error=decode_error`);
    }

    console.log("[Callback] Decoded User Payload:", decodedPayload);

    const userObj = decodedPayload.user || decodedPayload;
    const role = (userObj.role || "STUDENT").toUpperCase();
    const rolePath = role.toLowerCase();

    // 🔹 Determine dashboard redirect (Matching RootPage logic)
    let dashboardPath = `/${rolePath}/dashboard`;
    if (role === "OFFICIAL") {
      dashboardPath = "/official";
    } else if (role === "ADMIN") {
      dashboardPath = "/admin";
    }

    const dashboardUrl = new URL(dashboardPath, request.url);
    const host = request.headers.get("host") || "";
    const xProto = request.headers.get("x-forwarded-proto");
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const isSecure = isLocalhost ? false : (xProto === "https" || request.nextUrl.protocol === "https:");

    console.log(`[Callback] Domain: ${host} | Proto: ${xProto || request.nextUrl.protocol} | Secure: ${isSecure}`);
    console.log(`[Callback] Final Redirect URL: ${dashboardUrl.toString()}`);

    // 🔹 Create redirect response
    const redirectResponse = NextResponse.redirect(dashboardUrl);

    // 🔹 Set secure HTTP-only cookie on the response
    redirectResponse.cookies.set("token", token, {
      httpOnly: true,
      secure: isSecure,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });

    return redirectResponse;
  } catch (error) {
    console.error("[Callback] Server error:", error);
    return NextResponse.redirect(
      `${CORE_API_URL}/login?error=server_error`
    );
  }
}
