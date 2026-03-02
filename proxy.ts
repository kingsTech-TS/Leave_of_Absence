import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Paths that never require authentication (public assets and auth API)
  if (
    pathname.includes('.') || // static files with extensions
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') || // allow the callback and login/logout APIs
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Handle Login Page specially
  if (pathname === '/login') {
    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        const role = (payload as any).role?.toLowerCase();
        
        if (role === 'admin') 
          return NextResponse.redirect(new URL('/admin', request.url));
        if (role) 
          return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
      } catch (e) {
        // invalid token, show login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 3. Protected Routes
  const isProtectedPath = 
    pathname.startsWith('/student') || 
    pathname.startsWith('/staff') || 
    pathname.startsWith('/admin') ||
    pathname === '/';

  if (isProtectedPath) {
    if (!token) {
      const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
      // Redirect to the Core Platform login
      return NextResponse.redirect(`${CORE_URL}/login?module=leave_of_absence`);
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const role = (payload as any).role;

      // Role-based authorization
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
      }
      if (pathname.startsWith('/student') && role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
      }
      if (pathname.startsWith('/staff') && role !== 'STAFF') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
      }

      // Root path redirect if logged in
      if (pathname === '/') {
        const rolePath = role.toLowerCase();
        return NextResponse.redirect(new URL(role === 'ADMIN' ? '/admin' : `/${rolePath}/dashboard`, request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token expired or invalid
      const response = NextResponse.redirect(new URL('/login?error=session_expired', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
