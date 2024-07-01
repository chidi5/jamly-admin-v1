/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/api/:path*",
  "/api/stores/:path*",
  "/api/resend-verification-email",
  "/",
  "/site/*",
  "/new-verification",
  "/new-password",
  "/join-team",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /store
 * @type {string[]}
 */
export const authRoutes = ["/sign-in", "/sign-up", "/reset"];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API auth purposes
 * @type {string}
 */
export const ApiauthPrefix = "/api/auth,";

/**
 * The default redirect after authentication
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/store";
