import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  let isAuth = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      isAuth = true;
    } catch {
      isAuth = false;
    }
  }

  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Pages privées : redirection vers /login si non authentifié
  const isPrivatePage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/students");

  if (isPrivatePage && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Pages publiques (login/register) : redirection vers /dashboard si déjà connecté
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/login",
    "/register",
  ],
};