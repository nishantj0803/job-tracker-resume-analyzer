// middleware.ts — server-side route protection (NextAuth JWT).
// Client-side AuthProvider redirects remain as UX fallback; this is the
// actual security boundary.
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const USER_ROUTES = [
  "/dashboard",
  "/jobs",
  "/resume",
  "/analytics",
  "/ai",
  "/settings",
];

function isUserRoute(pathname: string) {
  return USER_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin") && pathname !== "/admin/login";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isUserRoute(pathname) && !isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const login = new URL(
      pathname.startsWith("/admin") ? "/admin/login" : "/login",
      request.url
    );
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const role = (token as { role?: string }).role;
  if (isAdminRoute(pathname) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname === "/dashboard" && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/resume/:path*",
    "/analytics/:path*",
    "/ai/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
