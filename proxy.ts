import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map(c => c.name).join(', ');
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";

  console.log(`[Proxy] Request: ${pathname} | Cookies found: ${cookieNames || 'none'}`);

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
    console.log(`[Proxy] AUTH REQUIRED: Redirecting from ${pathname} to login. Cookie 'token' missing.`);
    const loginUrl = `${CORE_URL}/login?module=leave_of_absence&redirect=${encodeURIComponent(request.url)}`;
    return NextResponse.redirect(loginUrl);
  }

  // 3. ROOT PATH REDIRECTION
  if (pathname === '/') {
    if (!token) {
      console.log(`[Proxy] ROOT: No 'token' cookie. Redirecting to Core login.`);
      return NextResponse.redirect(`${CORE_URL}/login?module=leave_of_absence`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
