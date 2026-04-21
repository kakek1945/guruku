"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { AppIcon } from "@/components/app-icon";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Ganti tema"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-card text-foreground",
          className,
        )}
      >
        <AppIcon name="settings" className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-card text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-card/90",
        className,
      )}
    >
      <AppIcon name={isDark ? "sun" : "moon"} className="h-4 w-4" />
    </button>
  );
}
