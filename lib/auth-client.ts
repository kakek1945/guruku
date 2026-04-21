import { createAuthClient } from "better-auth/react";

import { appConfig } from "@/lib/app-config";

export const authClient = createAuthClient({
  ...(appConfig.authBaseUrl ? { baseURL: appConfig.authBaseUrl } : {}),
  sessionOptions: {
    refetchOnWindowFocus: true,
    refetchWhenOffline: false,
  },
});
