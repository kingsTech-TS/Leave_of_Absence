import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;

  const CORE_URL =
    process.env.CORE_API_URL || "https://eksucore.vercel.app";

  console.log(
    `[Proxy] Path: ${pathname} | Auth: ${token ? "present" : "missing"}`
  );

  // Allow public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const protectedRoutes = [
    "/student",
    "/staff",
    "/official",
    "/admin",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    console.log(`[Proxy] Redirecting to Core login`);

    const loginUrl = `${CORE_URL}/login?module=leave_of_absence&redirect=${encodeURIComponent(
      request.url
    )}`;

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};