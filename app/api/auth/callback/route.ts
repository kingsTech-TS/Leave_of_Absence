import { NextRequest, NextResponse } from "next/server";
import { decodeJWT } from "@/lib/core-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");
  const host = request.headers.get("host") || "";

  console.log(`[Callback] Init | Host: ${host} | Ref: ${ref ? "present" : "missing"}`);

  const CORE_API_URL =
    process.env.CORE_API_URL || "https://eksucore.vercel.app";
  const CORE_SYSTEM_SECRET = process.env.CORE_SYSTEM_SECRET;

  if (!ref) {
    return NextResponse.redirect(`${CORE_API_URL}/login?error=missing_reference`);
  }

  if (!CORE_SYSTEM_SECRET) {
    console.error("[Callback] Missing CORE_SYSTEM_SECRET.");
    return NextResponse.redirect(`${CORE_API_URL}/login?error=system_config_error`);
  }

  try {
    // Step 1: Verify reference with Core
    const verificationResponse = await fetch(
      `${CORE_API_URL}/api/verify-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-system-secret": CORE_SYSTEM_SECRET,
        },
        body: JSON.stringify({ reference: ref }),
      }
    );

    if (!verificationResponse.ok) {
      console.error("[Callback] Reference verification failed");
      return NextResponse.redirect(`${CORE_API_URL}/login?error=verification_failed`);
    }

    const { token } = await verificationResponse.json();

    if (!token) {
      console.error("[Callback] Core did not return a token.");
      return NextResponse.redirect(`${CORE_API_URL}/login?error=no_token`);
    }

    // Step 2: Decode JWT only to determine role for redirect
    const decodedPayload = decodeJWT(token);
    if (!decodedPayload) {
      console.error("[Callback] Failed to decode JWT");
      return NextResponse.redirect(`${CORE_API_URL}/login?error=decode_error`);
    }

    const userObj = decodedPayload.user || decodedPayload;
    const role = (userObj.role || "STUDENT").toUpperCase();

    // Step 3: Determine dashboard route
    let dashboardPath = `/${role.toLowerCase()}/dashboard`;

    if (role === "OFFICIAL") dashboardPath = "/official";
    if (role === "ADMIN") dashboardPath = "/admin";

    const isLocalhost =
      host.includes("localhost") || host.includes("127.0.0.1");

    const scheme = isLocalhost ? "http" : "https";

    const dashboardUrl = `${scheme}://${host}${dashboardPath}`;

    console.log(`[Callback] Role: ${role} → Redirecting to ${dashboardUrl}`);

    // Step 4: Set auth cookie
    const response = NextResponse.redirect(dashboardUrl);

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: !isLocalhost,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[Callback] Unexpected error:", error);
    return NextResponse.redirect(`${CORE_API_URL}/login?error=server_error`);
  }
}