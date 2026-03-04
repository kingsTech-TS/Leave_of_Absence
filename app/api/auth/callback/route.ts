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
        console.error("[Callback] No token returned from verify-session. Keys:", Object.keys(responseData));
        return NextResponse.redirect(`${CORE_API_URL}/login?error=no_token_from_core`);
    }

    console.log(`[Callback] Verification OK. Token length: ${token.length}. First 10: ${token.substring(0, 10)}...`);

    // Redirect based on role
    const normalizedRole = user.role?.toUpperCase() || "STUDENT";
    const rolePath = normalizedRole.toLowerCase();
    
    // Build the absolute URL for redirect
    const dashboardUrl = new URL(normalizedRole === "OFFICIAL" ? "/official" : `/${rolePath}/dashboard`, request.url);

    console.log(`[Callback] Setting token cookie and redirecting to: ${dashboardUrl.toString()}`);

    // Set cookie using next/headers (for server context)
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: true, // Force secure for Vercel
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });

    // Also set it on the response for immediate effect in some environments
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    redirectResponse.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });

    return redirectResponse;

  } catch (error) {
    console.error("[Callback] Server error:", error);
    return NextResponse.redirect(`${CORE_API_URL}/login?error=server_error`);
  }
}
