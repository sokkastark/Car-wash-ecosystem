import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ISO-Standard Next.js Dynamic Subdomain Routing Middleware.
 * Under 250 lines. Handles both local development and production.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";

  // Exclude static assets, files, images, and API routes from subdomain rewrites
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Detect simplified subdomains (local or production)
  let portalGroup = "";
  if (host.toLowerCase().startsWith("cwadmin.")) {
    portalGroup = "admin";
  } else if (host.toLowerCase().startsWith("cwworker.")) {
    portalGroup = "worker";
  } else if (host.toLowerCase().startsWith("cwcustomer.")) {
    portalGroup = "customer";
  }

  // Perform transparent internal rewrite to layout route groups
  if (portalGroup) {
    url.pathname = `/${portalGroup}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Default path continue normally
  return NextResponse.next();
}

// Intercept all paths except standard assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
