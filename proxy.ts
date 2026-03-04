import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const CORE_URL = process.env.NEXT_PUBLIC_CORE_URL || "https://eksucore.vercel.app";

  // 1. PUBLIC ASSETS & UTILITIES
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. PROTECTED ROUTES REDIRECTION
  const isProtectedPath =
    pathname.startsWith('/student') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/official');

  if (isProtectedPath && !token) {
    const loginUrl = `${CORE_URL}/login?module=leave_of_absence&redirect=${encodeURIComponent(request.url)}`;
    return NextResponse.redirect(new URL(loginUrl));
  }

  // 3. ROOT PATH REDIRECTION - Try to send them to their dashboard if logged in
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(`${CORE_URL}/login?module=leave_of_absence`);
    }
    // We don't verify the role here to avoid a slow API call in proxy.
    // The role-specific dashboards will redirect them if they land in the wrong place.
    // Defaulting to root or a general landing is fine if unsure.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
