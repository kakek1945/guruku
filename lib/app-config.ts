export const appConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "",
  authBaseUrl: process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || "",
};

// The app can use same-origin API/auth routes on Vercel and local Next.js deployments,
// so these features should stay enabled even when NEXT_PUBLIC_* overrides are omitted.
export const isApiConfigured = true;
export const isAuthConfigured = true;
