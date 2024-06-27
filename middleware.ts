import { NextResponse } from "next/server";
import { auth } from "./auth";
import {
  ApiauthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
} from "./route";

export default auth((req) => {
  const { nextUrl } = req;
  const isSignedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(ApiauthPrefix);
  const isPublicRoutes = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isSignedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isSignedIn && !isPublicRoutes) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  const searchParams = nextUrl.searchParams.toString();
  let hostname = req.headers;

  const pathWithSearchParams = `${nextUrl.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  if (
    nextUrl.pathname === "/" ||
    (nextUrl.pathname === "/site" &&
      nextUrl.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL("/site", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
