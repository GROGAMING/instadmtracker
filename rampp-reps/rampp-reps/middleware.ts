import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const picked = request.cookies.get("rampp_who");
  const path = request.nextUrl.pathname;

  if (!picked && path !== "/who") {
    const url = request.nextUrl.clone();
    url.pathname = "/who";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
