"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      try {
        const result = await authClient.signIn.email({
          email,
          password,
          rememberMe: true,
          callbackURL: "/dashboard",
        });

        if (result.error) {
          setErrorMessage(result.error.message || "Login gagal. Periksa kembali akun Anda.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Tidak dapat menghubungi server autentikasi.";
        setErrorMessage(message);
      }
    });
  };

  return (
    <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="email">Email / nomor induk</Label>
        <Input
          id="email"
          placeholder="guru@smpn4.sch.id"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

      <Button type="submit" className="mt-2 w-full" size="lg" aria-busy={isPending}>
        {isPending ? "Memproses..." : "Masuk"}
      </Button>
      <Button href="/" className="w-full" variant="ghost">
        Kembali ke halaman depan
      </Button>
    </form>
  );
}
