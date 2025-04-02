import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// This function handles route protection and redirection based on authentication status and role
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const path = url.pathname;

  // Auth routes that should redirect to dashboard if user is already logged in
  const authRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify",
  ];

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/checkout", "/orders"];

  // Dashboard routes - only for farmers
  const farmerOnlyRoutes = ["/dashboard"];

  // If user is logged in
  if (token) {
    const userRole = token.role as string;

    // Check if the current path is an auth route or starts with any auth route path
    const isAuthRoute = authRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    if (isAuthRoute) {
      // Redirect to dashboard if user is a farmer
      if (userRole === "farmer") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // Redirect to homepage if user is a customer
      else if (userRole === "customer") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Check if customer is trying to access farmer-only routes
    if (userRole === "customer") {
      const isFarmerOnlyRoute = farmerOnlyRoutes.some(
        (route) => path === route || path.startsWith(`${route}/`)
      );

      if (isFarmerOnlyRoute) {
        // Redirect customers away from dashboard to homepage
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }
  // If user is not logged in and trying to access protected routes, redirect to sign-in
  else {
    const isProtectedRoute = protectedRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    if (isProtectedRoute) {
      // Redirect to sign-in if user is not authenticated
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Continue with the request for non-protected routes or authorized users
  return NextResponse.next();
}

// Define the paths that the middleware should run on
export const config = {
  matcher: [
    // Auth routes
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify/:path*",

    // Protected routes
    "/dashboard/:path*",
    "/checkout/:path*",
    "/orders/:path*",
  ],
};
