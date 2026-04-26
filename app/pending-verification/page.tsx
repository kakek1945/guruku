"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PendingVerificationPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
    // @ts-ignore
    if (!isPending && session?.user?.isVerified) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  if (isPending) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-yellow-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold leading-none tracking-tight">Akun Menunggu Verifikasi</h1>
          <p className="text-sm text-muted-foreground">
            Pendaftaran Anda berhasil, namun akun Anda saat ini sedang menunggu persetujuan dari Administrator.
          </p>
        </div>
        <div className="text-center text-sm text-muted-foreground mb-6">
          <p>
            Silakan hubungi admin sekolah untuk mempercepat proses verifikasi. Anda akan dapat mengakses dashboard setelah akun Anda disetujui.
          </p>
        </div>
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            {isSigningOut ? "Keluar..." : "Keluar Akun"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
