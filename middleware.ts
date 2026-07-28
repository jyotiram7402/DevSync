import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_AUTHENTICATED_REDIRECT,
  isAuthRoute,
  isProtectedRoute,
  LOGIN_ROUTE,
} from "@/lib/auth/redirect";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Project middleware.
 *
 * 1. Refreshes the Supabase session on every matched request.
 * 2. Protects authenticated routes — unauthenticated visitors to a protected
 *    route are redirected to /login with a `next` param.
 * 3. Redirects already-authenticated users away from guest-only auth routes.
 *
 * Refreshed session cookies are preserved across redirects. RLS remains the
 * authoritative data boundary; this is the routing layer of defense in depth.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isAuthenticated = user !== null;

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    return buildRedirect(request, response, LOGIN_ROUTE, { next: pathname });
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return buildRedirect(request, response, DEFAULT_AUTHENTICATED_REDIRECT);
  }

  return response;
}

/** Builds a redirect that carries over any refreshed session cookies. */
function buildRedirect(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  params?: Record<string, string>,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const redirect = NextResponse.redirect(url);
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie.name, cookie.value, cookie);
  }
  return redirect;
}

/**
 * Run on application routes only. Static assets, image optimization, the
 * favicon, and common asset file types are excluded.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
