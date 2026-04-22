import { teacherProfile as defaultTeacherProfile } from "@/lib/mock-data";

const subjectSplitPattern = /[\n,;]+/;

export function parseTeacherSubjects(value: string | null | undefined) {
  const subjects = (value || "")
    .split(subjectSplitPattern)
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(subjects));
}

export function serializeTeacherSubjects(subjects: string[]) {
  const cleaned = Array.from(
    new Set(
      subjects
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

  return cleaned.join(", ");
}

export function getTeacherSubjects(value: string | null | undefined) {
  const parsed = parseTeacherSubjects(value);

  if (parsed.length > 0) {
    return parsed;
  }

  return parseTeacherSubjects(defaultTeacherProfile.role);
}

export function resolveTeacherSubject(
  requestedSubject: string | null | undefined,
  storedValue: string | null | undefined,
) {
  const subjects = getTeacherSubjects(storedValue);

  if (requestedSubject && subjects.includes(requestedSubject)) {
    return requestedSubject;
  }

  return subjects[0] || "Mapel belum diatur";
}

export function formatTeacherRoleLabel(value: string | null | undefined) {
  return getTeacherSubjects(value).join(", ");
}
