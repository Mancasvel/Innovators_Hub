import createIntlMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware for route protection, role-based access control, and internationalization
 * Protects /user/** and /organizer/** routes
 */

const intlMiddleware = createIntlMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
});

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user is accessing organizer routes
    if (path.startsWith("/organizer")) {
      if (token?.role !== "organizer" && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Check if user is accessing admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  },
);

// Specify which routes should be protected
export const config = {
  matcher: [
    // Only protect these specific routes
    "/user/:path*",
    "/organizer/:path*",
    "/admin/:path*",
  ],
};
