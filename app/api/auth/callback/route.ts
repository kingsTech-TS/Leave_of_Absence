import { NextRequest, NextResponse } from "next/server";
import { decodeJWT } from "@/lib/core-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");
  const host = request.headers.get("host") || "";

  console.log(`[Callback] Init | Host: ${host} | Ref: ${ref ? "present" : "missing"}`);

  const CORE_API_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
  const CORE_SYSTEM_SECRET = process.env.CORE_SYSTEM_SECRET;

  if (!ref) {
    return NextResponse.redirect(`${CORE_API_URL}/login?error=missing_reference`);
  }

  if (!CORE_SYSTEM_SECRET) {
    console.error("[Callback] Missing CORE_SYSTEM_SECRET env variable.");
    return NextResponse.redirect(`${CORE_API_URL}/login?error=system_config_error`);
  }

  try {
    // 🔹 Step 1: Verify the ref with the Core Platform to get the JWT token
    const verificationResponse = await fetch(`${CORE_API_URL}/api/verify-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: ref, secret: CORE_SYSTEM_SECRET }),
    });

    if (!verificationResponse.ok) {
      const errData = await verificationResponse.json().catch(() => ({}));
      console.error("[Callback] Verification failed:", errData);
      return NextResponse.redirect(`${CORE_API_URL}/login?error=verification_failed`);
    }

    const responseData = await verificationResponse.json();
    const { token } = responseData;

    if (!token) {
      console.error("[Callback] No token in verify-session response.");
      return NextResponse.redirect(`${CORE_API_URL}/login?error=no_token_from_core`);
    }

    // 🔹 Step 2: Decode the JWT locally to extract the user role
    const decodedPayload = decodeJWT(token);
    if (!decodedPayload) {
      console.error("[Callback] JWT decode failed.");
      return NextResponse.redirect(`${CORE_API_URL}/login?error=decode_error`);
    }

    console.log("[Callback] Decoded payload:", JSON.stringify(decodedPayload));

    const userObj = decodedPayload.user || decodedPayload;
    const role = (userObj.role || "STUDENT").toUpperCase();

    // 🔹 Step 3: Determine dashboard path based on role
    let dashboardPath = `/${role.toLowerCase()}/dashboard`;
    if (role === "OFFICIAL") dashboardPath = "/official";
    if (role === "ADMIN") dashboardPath = "/admin";

    // 🔹 Step 4: Build same-host redirect URL (CRITICAL: ensures cookie domain matches the current host)
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    const scheme = isLocalhost ? "http" : "https";
    const dashboardUrl = `${scheme}://${host}${dashboardPath}`;

    console.log(`[Callback] Role: ${role} | Secure: ${!isLocalhost} | Redirecting to: ${dashboardUrl}`);

    // 🔹 Step 5: Set the cookie on the redirect response
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    redirectResponse.cookies.set("token", token, {
      httpOnly: true,
      secure: !isLocalhost, // true on Vercel (https), false on localhost
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return redirectResponse;
  } catch (error) {
    console.error("[Callback] Unexpected server error:", error);
    return NextResponse.redirect(`${CORE_API_URL}/login?error=server_error`);
  }
}
