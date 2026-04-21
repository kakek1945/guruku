export const appConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "",
  authBaseUrl: process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || "",
};

export const isApiConfigured = Boolean(appConfig.apiBaseUrl);
export const isAuthConfigured = Boolean(appConfig.authBaseUrl);
