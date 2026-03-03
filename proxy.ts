import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";

  // 1. PUBLIC ASSETS & UTILITIES
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. ROOT PATH REDIRECTION
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(`${CORE_URL}/login?module=leave_of_absence`);
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const role = (payload as any).role;
      const rolePath = role === 'OFFICIAL' ? 'official' : `${role?.toLowerCase()}/dashboard`;
      return NextResponse.redirect(new URL(`/${rolePath}`, request.url));
    } catch (e) {
      return NextResponse.redirect(`${CORE_URL}/login?module=leave_of_absence`);
    }
  }

  // 3. PROTECTED ROUTES
  const isProtectedPath =
    pathname.startsWith('/student') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/official');

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(`${CORE_URL}/login?module=leave_of_absence`);
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const role = (payload as any).role;

      // ROLE GUARD
      if (pathname.startsWith('/official') && role !== 'OFFICIAL') {
        return NextResponse.redirect(`${CORE_URL}/login?error=unauthorized`);
      }
      if (pathname.startsWith('/student') && role !== 'STUDENT') {
        return NextResponse.redirect(`${CORE_URL}/login?error=unauthorized`);
      }
      if (pathname.startsWith('/staff') && role !== 'STAFF') {
        return NextResponse.redirect(`${CORE_URL}/login?error=unauthorized`);
      }

      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(`${CORE_URL}/login?error=session_expired`);
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};