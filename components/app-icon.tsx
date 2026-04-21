import { cn } from "@/lib/utils";

export type IconName =
  | "dashboard"
  | "kelas"
  | "jurnal"
  | "absensi"
  | "nilai"
  | "materi"
  | "media"
  | "video"
  | "settings"
  | "info"
  | "sun"
  | "moon"
  | "bell"
  | "calendar"
  | "users"
  | "book"
  | "play"
  | "upload"
  | "search"
  | "check"
  | "edit"
  | "menu"
  | "close";

type AppIconProps = {
  name: IconName;
  className?: string;
};

export function AppIcon({ name, className }: AppIconProps) {
  const shared = "h-5 w-5 shrink-0";

  const icons: Record<IconName, React.ReactNode> = {
    dashboard: (
      <path d="M4 4h6v7H4V4Zm10 0h6v4h-6V4ZM14 12h6v8h-6v-8ZM4 15h6v5H4v-5Z" />
    ),
    kelas: <path d="M4 7 12 3l8 4-8 4-8-4Zm2 4.5 6 3 6-3M6 16l6 3 6-3" />,
    jurnal: <path d="M7 4h9a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2h3Zm1 5h8m-8 4h6" />,
    absensi: <path d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 8 2 2 4-4" />,
    nilai: <path d="M5 20V9m7 11V4m7 16v-7M3 20h18" />,
    materi: <path d="M6 4h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 1v5h5" />,
    media: <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm3 9 2.5-2.5 2.5 2.5 3.5-4 2.5 3V18H6v-3Zm3-6h.01" />,
    video: <path d="M5 6a2 2 0 0 1 2-2h6.5a2 2 0 0 1 1.6.8l.8 1.1a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Zm5 3 5 3-5 3V9Z" />,
    settings: <path d="M12 3.5 14 5l2.4-.5 1.1 2.2 2.3 1.1-.5 2.4L20.5 12 19 14l.5 2.4-2.2 1.1-1.1 2.3-2.4-.5L12 20.5 10 19l-2.4.5-1.1-2.2-2.3-1.1.5-2.4L3.5 12 5 10l-.5-2.4 2.2-1.1 1.1-2.3L10 5l2-1.5Zm0 5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />,
    info: <path d="M12 8h.01M11 11h1v5h1m-1 6C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z" />,
    sun: <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M3 12h2.2M18.8 12H21M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
    moon: <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
    bell: <path d="M15 17H9m9-1H6l1.4-1.4A2 2 0 0 0 8 13.2V10a4 4 0 1 1 8 0v3.2c0 .5.2 1 .6 1.4L18 16Zm-4 1a2 2 0 0 1-4 0" />,
    calendar: <path d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m17 0v-2a4 4 0 0 0-3-3.9M14 4.1a4 4 0 1 1 0 7.8M9.5 11A4 4 0 1 0 9.5 3a4 4 0 0 0 0 8Z" />,
    book: <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4Zm0 0a3 3 0 0 0-3 3v13h3m6-10h5" />,
    play: <path d="m10 8 6 4-6 4V8Zm10 4A8 8 0 1 1 4 12a8 8 0 0 1 16 0Z" />,
    upload: <path d="M12 16V5m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />,
    search: <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />,
    check: <path d="M20 6 9 17l-5-5" />,
    edit: <path d="m4 20 4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Zm10.5-12.5 3 3" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(shared, className)}
      shapeRendering="geometricPrecision"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

export function AdminAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border border-[#e6d7b1] bg-[#fff7e2] text-[#1f6d59]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0 2.1c-4 0-7.2 2.4-7.2 5.3 0 .8.6 1.4 1.4 1.4h11.6c.8 0 1.4-.6 1.4-1.4 0-2.9-3.2-5.3-7.2-5.3Z" />
      </svg>
    </div>
  );
}
