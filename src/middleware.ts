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
];

// Define authentication routes that should redirect to home if user is already logged in
const authRoutes = [
  "/sign-up",
  "/sign-in",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

// Define routes that require specific roles
const farmerRoutes = ["/dashboard/farmer", "/products/manage"];
const customerRoutes = ["/dashboard/customer", "/orders"];

export default async function middleware(req: NextRequestWithAuth) {
  const pathname = req.nextUrl.pathname;

  // Get the user's token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If user is authenticated and trying to access auth routes, redirect to home
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check if the route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If no token, redirect to sign-in
  if (!token) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Check if user is verified
  if (!token.isVerified) {
    return NextResponse.redirect(new URL("/verify", req.url));
  }

  // Role-based access control
  if (token.role === "farmer" && pathname === "/dashboard") {
    return NextResponse.redirect(new URL(`/dashboard/farmer/${token.name}`, req.url));
  }
  
  if (token.role === "customer" && pathname === "/dashboard") {
    return NextResponse.redirect(new URL(`/dashboard/customer/${token.name}`, req.url));
  }
  
  if (
    farmerRoutes.some((route) => pathname.startsWith(route)) &&
    token.role !== "farmer"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  
  if (
    customerRoutes.some((route) => pathname.startsWith(route)) &&
    token.role !== "customer"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // If all checks pass, proceed to the requested page
  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes (API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};