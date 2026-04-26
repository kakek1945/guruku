import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/register-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun | Guruku",
  description: "Daftar akun baru di platform Guruku.",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-10" />
      <div className="container relative flex min-h-screen items-center justify-center py-10">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="space-y-3 text-center">
            <Badge className="border border-[#ead8a7] bg-[#fff1c7] text-accent-foreground">Daftar Akun</Badge>
            <h1 className="text-3xl font-semibold md:text-4xl">Buat Akun Baru</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Silakan mendaftar untuk mengakses fitur Guruku. Akun Anda perlu diverifikasi setelah pendaftaran.
            </p>
          </div>
          <RegisterForm />
        </Card>
      </div>
    </main>
  );
}
