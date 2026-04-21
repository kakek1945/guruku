const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const thumbnailFallbacks = {
  material: "#2f8a72",
  media: "#90c1ad",
  video: "#2d8a71",
};

export function formatDisplayDate(date: Date | string) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return `${parsedDate.getDate()} ${monthNames[parsedDate.getMonth()] ?? "Jan"} ${parsedDate.getFullYear()}`;
}

export function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function toThumbnailBackground(
  thumbnailPath: string | null | undefined,
  type: keyof typeof thumbnailFallbacks,
) {
  if (thumbnailPath) {
    const safePath = thumbnailPath.replace(/"/g, '\\"');
    return `center / cover no-repeat url("${safePath}")`;
  }

  return thumbnailFallbacks[type];
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function inferMaterialType(fileName: string | null | undefined, externalLink: string | null | undefined) {
  if (fileName) {
    const extension = fileName.split(".").pop()?.toUpperCase();
    return extension || "FILE";
  }

  if (externalLink) {
    return "Link";
  }

  return "Materi";
}

export function normalizeYouTubeSource(source: string) {
  if (/youtube/i.test(source)) {
    return "YouTube";
  }

  if (/drive/i.test(source)) {
    return "Google Drive";
  }

  return source || "Website lain";
}
