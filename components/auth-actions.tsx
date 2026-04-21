"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type AuthActionsProps = {
  className?: string;
};

export function AuthActions({ className }: AuthActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
