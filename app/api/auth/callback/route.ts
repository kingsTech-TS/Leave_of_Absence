import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");

  const CORE_API_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
  const CORE_SYSTEM_SECRET = process.env.CORE_SYSTEM_SECRET;

  if (!ref) {
    return NextResponse.redirect(`${CORE_API_URL}/login?error=missing_reference`);
  }

  if (!CORE_API_URL || !CORE_SYSTEM_SECRET) {
    console.error("Missing CORE_API_URL or CORE_SYSTEM_SECRET environment variables.");
    return NextResponse.redirect(`${CORE_API_URL || 'https://eksucore.vercel.app'}/login?error=system_config_error`);
  }

  try {
    const response = await fetch(`${CORE_API_URL}/api/verify-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: ref,
        secret: CORE_SYSTEM_SECRET,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Verification failed:", errData);
      return NextResponse.redirect(`${CORE_API_URL}/login?error=verification_failed`);
    }

    const responseData = await response.json();
    console.log("[Callback] Verification response received:", !!responseData.token ? "Token present" : "Token MISSING");
    
    const { user, token } = responseData;

    if (!token) {
        console.error("[Callback] No token returned from verification");
        return NextResponse.redirect(`${CORE_API_URL}/login?error=no_token_from_core`);
    }

    // Set the auth_token cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });

    console.log(`[Callback] Cookie set, user role: ${user.role}. Redirecting...`);

    // Redirect based on role
    const rolePath = user.role.toLowerCase();
    
    if (user.role === "OFFICIAL") {
        return NextResponse.redirect(new URL("/official", request.url));
    }
    
    const dashboardUrl = new URL(`/${rolePath}/dashboard`, request.url);
    console.log(`[Callback] Final redirect to: ${dashboardUrl.toString()}`);
    return NextResponse.redirect(dashboardUrl);

  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(`${CORE_API_URL}/login?error=server_error`);
  }
}
