import { apiRequest } from "@/lib/api-client";
import type { HomePageApiResponse } from "@/lib/api-types";

export function getHomePageData() {
  return apiRequest<HomePageApiResponse>("/api/public/home");
}
