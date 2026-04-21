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

export function displayAuthLogin(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed.includes("@")) {
    return trimmed;
  }

  const [localPart, domainPart] = trimmed.split("@");

  if (!localPart || !domainPart) {
    return trimmed;
  }

  if (domainPart.endsWith(".local")) {
    return `${localPart}@${domainPart.slice(0, -6)}`;
  }

  return trimmed;
}
