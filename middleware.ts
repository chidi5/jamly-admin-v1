import { NextResponse } from "next/server";
import { auth } from "./auth";
import {
  ApiauthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
} from "./route";

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export default auth((req) => {
  const { nextUrl } = req;
  const isSignedIn = !!req.auth;
  const origin = req.headers.get("origin") ?? "";

  // Handle preflighted requests
  const isPreflight = req.method === "OPTIONS";

  if (isPreflight) {
    const preflightHeaders = {
      ...{ "Access-Control-Allow-Origin": origin },
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", origin);

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  const isApiAuthRoute = nextUrl.pathname.startsWith(ApiauthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoutes = publicRoutes.some((route) =>
    new RegExp(`^${route.replace(/:[^\s/]+/g, ".*")}$`).test(nextUrl.pathname)
  );

  if (isApiAuthRoute) {
    return response;
  }

  if (isAuthRoute) {
    if (isSignedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return response;
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

  return response;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
  unstable_allowDynamic: ["**/node_modules/@react-email*/**/*.mjs*"],
};
