import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/products",
  "/checkout/success",
  "/checkout/cancel",
];

// Define authentication routes that should redirect to home if user is already logged in
const authRoutes = [
  "/sign-up",
  "/sign-in",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

export default async function middleware(req: NextRequestWithAuth) {
  const pathname = req.nextUrl.pathname;

  // Get the user's token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the route is a public route or a product detail page
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.match(/^\/products\/[\w-]+$/);

  // Check if it's an API route
  const isApiRoute = pathname.startsWith("/api/");

  // Skip middleware for public routes and API routes
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access auth routes, redirect to home
  if (token && authRoutes.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If no token and trying to access a protected route, redirect to sign-in
  if (!token && !isPublicRoute && !isApiRoute) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Check if user is verified
  if (token && !token.isVerified && !pathname.startsWith("/verify")) {
    return NextResponse.redirect(new URL("/verify", req.url));
  }

  // Role-based access control for dashboard
  if (token && token.role === "farmer" && pathname === "/dashboard") {
    return NextResponse.redirect(
      new URL(`/dashboard/farmer/${token.id}`, req.url)
    );
  }

  // Role-specific routes protection
  if (
    token &&
    pathname.startsWith("/dashboard/farmer") &&
    token.role !== "farmer"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (token && pathname.startsWith("/orders") && token.role !== "customer") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // If all checks pass, proceed to the requested page
  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    // Authentication routes
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/verify/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",

    // Protected app routes
    "/dashboard/:path*",
    "/orders/:path*",

    // Public routes (we still need middleware for redirecting authenticated users)
    "/",
    "/products",
    "/products/:path*",
  ],
};
