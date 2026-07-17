import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

function isDashboardRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;
  const role = session?.user?.role ?? "USER";

  // Belum login
  if (!session && isDashboardRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/dashboard" : "/dashboard/nilai-saya", request.url)
    );
  }

  if (session && isDashboardRoute(pathname)) {
    const isUser = role === "USER";
    const isAdmin = role === "ADMIN";

    if (isUser) {
      const blockedRoutes = ["/dashboard", "/dashboard/nilai-siswa", "/dashboard/master-mapel"];
      if (blockedRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard/nilai-saya", request.url));
      }
    }

    if (isAdmin && pathname === "/dashboard/nilai-saya") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};