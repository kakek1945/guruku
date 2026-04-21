import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-10" />
      <div className="container relative flex min-h-screen items-center justify-center py-10">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="space-y-3 text-center">
            <Badge className="border border-[#ead8a7] bg-[#fff1c7] text-accent-foreground">Login guru</Badge>
            <h1 className="text-3xl font-semibold md:text-4xl">Masuk ke dashboard</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Gunakan email sekolah atau nomor induk.
            </p>
          </div>
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
