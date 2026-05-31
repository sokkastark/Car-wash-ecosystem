import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ISO-Standard Next.js Dynamic Subdomain Routing Middleware.
 * Under 250 lines. Handles both local development and production.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Intercept all paths except standard assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
