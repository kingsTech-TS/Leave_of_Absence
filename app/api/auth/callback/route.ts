import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    console.log(
      `[Callback] Token received. Length: ${token.length}. First 10: ${token.substring(
        0,
        10
      )}...`
    );

    // 🔹 OPTION 3 — Manual JWT Decode
    const payloadBase64 = token.split(".")[1];

    // Convert base64url → base64
    const base64 = payloadBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decodedPayload = JSON.parse(
      Buffer.from(base64, "base64").toString("utf-8")
    );

    console.log("[Callback] Decoded JWT Payload:", decodedPayload);

    const role = decodedPayload.role?.toUpperCase() || "STUDENT";
    const rolePath = role.toLowerCase();

    // 🔹 Determine dashboard redirect
    const dashboardUrl = new URL(
      role === "ADMIN"
        ? "/admin"
        : `/${rolePath}/dashboard`,
      request.url
    );

    console.log(
      `[Callback] Redirecting user (${role}) to: ${dashboardUrl.toString()}`
    );

    // 🔹 Create redirect response
    const redirectResponse = NextResponse.redirect(dashboardUrl);

    // 🔹 Set secure HTTP-only cookie
    redirectResponse.cookies.set("token", token, {
      httpOnly: true,
      secure: true, // Required for Vercel HTTPS
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