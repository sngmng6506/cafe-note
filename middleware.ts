import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/health", "/manifest.webmanifest", "/apple-touch-icon.png"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/icons/") || pathname.startsWith("/_next/") || pathname === "/favicon.ico";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login" && authenticated) return NextResponse.redirect(new URL("/", request.url));
  if (isPublic(pathname)) return NextResponse.next();
  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "로그인이 필요해요." } }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!.*\\..*).*)", "/api/:path*"] };
