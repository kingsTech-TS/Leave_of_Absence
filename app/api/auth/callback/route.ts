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
    const verificationResponse = await fetch(`${CORE_API_URL}/api/verify-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: ref,
        secret: CORE_SYSTEM_SECRET,
      }),
    });

    if (!verificationResponse.ok) {
      const errData = await verificationResponse.json().catch(() => ({}));
      console.error("[Callback] Verification failed:", errData);
      return NextResponse.redirect(`${CORE_API_URL}/login?error=verification_failed`);
    }

    const responseData = await verificationResponse.json();
    const { user, token } = responseData;

    if (!token) {
        console.error("[Callback] No token returned from verification");
        return NextResponse.redirect(`${CORE_API_URL}/login?error=no_token_from_core`);
    }

    // Redirect based on role
    const normalizedRole = user.role?.toUpperCase();
    const rolePath = normalizedRole.toLowerCase();
    
    let dashboardUrl: URL;
    if (normalizedRole === "OFFICIAL") {
        dashboardUrl = new URL("/official", request.url);
    } else {
        dashboardUrl = new URL(`/${rolePath}/dashboard`, request.url);
    }

    console.log(`[Callback] Verification OK. Role: ${normalizedRole}. Setting auth_token and redirecting to: ${dashboardUrl.toString()}`);

    // Create redirect response
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    
    // Set the auth_token cookie on the response object
    redirectResponse.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });

    return redirectResponse;

  } catch (error) {
    console.error("[Callback] Server error:", error);
    return NextResponse.redirect(`${CORE_API_URL}/login?error=server_error`);
  }
}
