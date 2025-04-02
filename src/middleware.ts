import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-up",
  "/sign-in",
  "/verify",
  "/forgot-password",
  "/reset-password",
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

  // Get the user's token first - we'll check it for all routes
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if it's a public route or product detail page
  const isPublicRoute =
    publicRoutes.some((route) => pathname === route) ||
    pathname.match(/^\/products\/[\w-]+$/) ||
    pathname.startsWith("/api/");

  // Handle dashboard farmer specific route pattern explicitly
  const isDashboardFarmerRoute = pathname.startsWith("/dashboard/farmer");

  // If user is authenticated and trying to access auth routes, redirect to home
  if (token && authRoutes.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If it's a public route and not a dashboard route, allow access
  if (isPublicRoute && !isDashboardFarmerRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to sign-in
  if (!token) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Check if user is verified
  if (!token.isVerified) {
    return NextResponse.redirect(new URL("/verify", req.url));
  }

  // Role-based access control for dashboard
  if (token.role === "farmer" && pathname === "/dashboard") {
    return NextResponse.redirect(
      new URL(`/dashboard/farmer/${token.id}`, req.url)
    );
  }

  // Role-specific routes protection - make sure to check dashboard farmer routes
  if (isDashboardFarmerRoute && token.role !== "farmer") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/orders")) {
    if (token.role !== "customer") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // If all checks pass, proceed to the requested page
  return NextResponse.next();
}

// Configure which routes this middleware should run on - ensure it includes all paths
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
    "/dashboard/:path*", // Explicitly match dashboard routes
    "/dashboard/farmer/:path*", // Explicitly match farmer dashboard routes
  ],
};
