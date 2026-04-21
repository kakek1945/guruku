"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { isAuthConfigured } from "@/lib/app-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AuthActionsProps = {
  className?: string;
};

export function AuthActions({ className }: AuthActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isAuthConfigured) {
    return <Badge className={cn("dark:border-border dark:bg-card", className)}>Demo</Badge>;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      onClick={() =>
        startTransition(async () => {
          try {
            await authClient.signOut();
          } finally {
            router.push("/");
            router.refresh();
          }
        })
      }
      aria-busy={isPending}
    >
      {isPending ? "Keluar..." : "Keluar"}
    </Button>
  );
}
