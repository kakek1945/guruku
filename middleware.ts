import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.headers.get("cookie")?.includes("better-auth.session_token");
  
  if (!sessionCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let sessionData = null;
  if (sessionCookie) {
      try {
        const res = await fetch(new URL("/api/auth/get-session", request.url).toString(), {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        });
        if (res.ok) {
            sessionData = await res.json();
        }
      } catch (e) {
          // fetch error
      }
  }

  if (request.nextUrl.pathname.startsWith("/dashboard") && sessionData?.user) {
    const isVerified = sessionData.user.isVerified;
    if (!isVerified) {
        return NextResponse.redirect(new URL("/pending-verification", request.url));
    }
  }

  if ((request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")) && sessionData?.user) {
      const isVerified = sessionData.user.isVerified;
      if (isVerified) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
          return NextResponse.redirect(new URL("/pending-verification", request.url));
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
