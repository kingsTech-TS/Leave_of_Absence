import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // PUBLIC ROUTES
  if (
    pathname === '/' || // make root public
    pathname === '/login' ||
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // PROTECTED ROUTES
  const isProtectedPath =
    pathname.startsWith('/student') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/admin');

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // No token → redirect to Core
  if (!token) {
    const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
    return NextResponse.redirect(
      `${CORE_URL}/login?module=leave_of_absence`
    );
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const role = (payload as any).role;

    // ROLE GUARD
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
    if (pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
    if (pathname.startsWith('/staff') && role !== 'STAFF') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    return NextResponse.next();

  } catch (error) {
    const response = NextResponse.redirect(
      new URL('/login?error=session_expired', request.url)
    );
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};