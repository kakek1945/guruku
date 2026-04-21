import { appConfig } from "@/lib/app-config";

type ApiRequestOptions = RequestInit & {
  searchParams?: Record<string, string | number | boolean | undefined>;
};

function resolveApiUrl(path: string, searchParams?: ApiRequestOptions["searchParams"]) {
  const base =
    typeof window !== "undefined"
      ? appConfig.apiBaseUrl || window.location.origin
      : appConfig.apiBaseUrl || "http://localhost:3000";

  const url = new URL(path, base);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { searchParams, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;

  const response = await fetch(resolveApiUrl(path, searchParams), {
    ...rest,
    headers: isFormData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
  });

  if (!response.ok) {
    const message = await response.text();

    if (message) {
      let parsedMessage = "";

      try {
        const parsed = JSON.parse(message) as { message?: string };
        parsedMessage = parsed.message || "";
      } catch {
        // Message is plain text.
      }

      throw new Error(parsedMessage || message);
    }

    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
