// File: middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
// If you need to access the NextAuth.js session token (JWT strategy):
// import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  console.log(`Custom Middleware: Path: ${request.nextUrl.pathname}`);

  // Example: Log all cookies (NextAuth.js session cookies are typically httpOnly by default)
  // const allCookies = request.cookies.getAll();
  // console.log("Custom Middleware: Cookies received by request:", JSON.stringify(allCookies, null, 2));

  // Example: Accessing NextAuth.js token (if you're using JWT strategy for sessions)
  // This requires NEXTAUTH_SECRET to be set in your environment variables.
  // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  // if (token) {
  //   console.log("Custom Middleware: NextAuth.js token found:", JSON.stringify(token, null, 2));
  // } else {
  //   console.log("Custom Middleware: No NextAuth.js token found or JWT strategy not in use.");
  // }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, including NextAuth's /api/auth/** routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, register, admin/login (explicit auth pages to avoid middleware loops if redirecting)
     * - Any other public static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|admin/login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};