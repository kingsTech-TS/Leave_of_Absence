import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map(c => c.name).join(', ');
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host');

  const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";

  console.log(`[Proxy] Request: ${pathname} | Host: ${host} | Cookies: ${cookieNames || 'none'}`);

  // 1. PUBLIC ASSETS & UTILITIES (Direct bypass)
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Debug for internal paths
  if (!token) {
     const rawCookie = request.headers.get('cookie');
     console.log(`[Proxy] [Debug] No 'token' cookie for ${pathname}. Raw Cookie: ${rawCookie ? 'present (omitted)' : 'absent'}`);
  }

  // 2. PROTECTED ROUTES REDIRECTION
  const isProtectedPath =
    pathname.startsWith('/student') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/official');

  if (isProtectedPath && !token) {
    console.log(`[Proxy] AUTH REQUIRED: Redirecting ${pathname} to Core login.`);
    const loginUrl = `${CORE_URL}/login?module=leave_of_absence&redirect=${encodeURIComponent(request.url)}`;
    return NextResponse.redirect(loginUrl);
  }

  // Let all other paths (including '/') through to the App Router
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
