"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type AppBrandProps = {
  compact?: boolean;
  className?: string;
  hideText?: boolean;
};

export function AppBrand({ compact = false, className, hideText = false }: AppBrandProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] border border-border bg-white shadow-sm">
        <img
          src="/branding/guruku-logo.png"
          alt="Logo Guruku"
          className="h-full w-full object-cover"
        />
      </div>
      {!hideText ? (
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.18em] text-inherit">GURUKU</p>
          {!compact ? (
            <p className="text-xs text-muted-foreground">Portal guru dan konten belajar</p>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
