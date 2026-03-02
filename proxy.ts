import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  if (pathname.startsWith('/login') || pathname === '/') {
    if (token) {
      // Temporary: Bypass verification if jose not available to show login
      // Add verification back once jose is installed
      // const secret = new TextEncoder().encode(JWT_SECRET);
      // const { payload } = await jose.jwtVerify(token, secret);
      // const role = (payload as any).role?.toLowerCase();
      // if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      // if (role) return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // Protected paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Temporary: assume valid if token present
  return NextResponse.next();
/*
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const role = (payload as any).role;

    // Basic role protection
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/staff') && role !== 'STAFF') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
*/
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
