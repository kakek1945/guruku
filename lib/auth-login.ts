export function normalizeAuthLogin(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed.includes("@")) {
    return trimmed;
  }

  const [localPart, domainPart] = trimmed.split("@");

  if (!localPart || !domainPart) {
    return trimmed;
  }

  if (domainPart.includes(".")) {
    return trimmed;
  }

  return `${localPart}@${domainPart}.local`;
}
