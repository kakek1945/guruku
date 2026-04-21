import { apiRequest } from "@/lib/api-client";
import type {
  AttendanceApiResponse,
  ClassesApiResponse,
  DashboardAccountMutationResponse,
  DeleteClassResponse,
  DashboardOverviewApiResponse,
  DashboardSettingsApiResponse,
  DashboardSettingsMutationResponse,
  DashboardStudentImportResponse,
  JournalsApiResponse,
  MaterialsApiResponse,
  MediaVideosApiResponse,
  ScoresApiResponse,
} from "@/lib/api-types";

export function getDashboardOverview() {
  return apiRequest<DashboardOverviewApiResponse>("/api/dashboard/overview");
}

export function getDashboardSettings() {
  return apiRequest<DashboardSettingsApiResponse>("/api/dashboard/settings");
}

export function saveDashboardSettings(formData: FormData) {
  return apiRequest<DashboardSettingsMutationResponse>("/api/dashboard/settings", {
    method: "POST",
    body: formData,
  });
}

export function saveDashboardAccount(body: Record<string, unknown>) {
  return apiRequest<DashboardAccountMutationResponse>("/api/dashboard/account", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function importDashboardStudents(formData: FormData) {
  return apiRequest<DashboardStudentImportResponse>("/api/dashboard/students/import", {
    method: "POST",
    body: formData,
  });
}

export function getJournals(searchParams?: Record<string, string>) {
  return apiRequest<JournalsApiResponse>("/api/dashboard/journals", {
    searchParams,
  });
}

export function saveJournal(body: Record<string, unknown>) {
  return apiRequest<JournalsApiResponse & { message: string }>("/api/dashboard/journals", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getAttendance(searchParams: Record<string, string>) {
  return apiRequest<AttendanceApiResponse>("/api/dashboard/attendance", {
    searchParams,
  });
}

export function saveAttendance(body: Record<string, unknown>) {
  return apiRequest<{ message: string; summary: AttendanceApiResponse["summary"] }>("/api/dashboard/attendance", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getScores(searchParams: Record<string, string>) {
  return apiRequest<ScoresApiResponse>("/api/dashboard/scores", {
    searchParams,
  });
}

export function saveScores(body: Record<string, unknown>) {
  return apiRequest<{ message: string }>("/api/dashboard/scores", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getMaterials() {
  return apiRequest<MaterialsApiResponse>("/api/dashboard/materials");
}

export function saveMaterial(formData: FormData) {
  return apiRequest<{ message: string }>("/api/dashboard/materials", {
    method: "POST",
    body: formData,
  });
}

export function getMediaVideos() {
  return apiRequest<MediaVideosApiResponse>("/api/dashboard/media-videos");
}

export function saveMediaOrVideo(formData: FormData) {
  return apiRequest<{ message: string }>("/api/dashboard/media-videos", {
    method: "POST",
    body: formData,
  });
}

export function getClasses(searchParams: Record<string, string>) {
  return apiRequest<ClassesApiResponse>("/api/dashboard/classes", {
    searchParams,
  });
}

export function deleteClass(body: Record<string, unknown>) {
  return apiRequest<DeleteClassResponse>("/api/dashboard/classes", {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}
