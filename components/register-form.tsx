"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { normalizeAuthLogin } from "@/lib/auth-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SISWA");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      try {
        const result = await authClient.signUp.email({
          email: normalizeAuthLogin(email),
          password,
          name,
          role,
        } as any);

        if (result.error) {
          setErrorMessage(result.error.message || "Pendaftaran gagal. Periksa kembali data Anda.");
          return;
        }

        router.push("/pending-verification");
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
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          placeholder="Nama Anda"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email / nomor induk</Label>
        <Input
          id="email"
          placeholder="guru@smpn4.sch.id"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
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
          required
          minLength={8}
        />
      </div>
      <div>
        <Label htmlFor="role">Mendaftar Sebagai</Label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
          required
        >
          <option value="SISWA">Siswa</option>
          <option value="GURU">Guru</option>
        </select>
      </div>

      {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

      <Button type="submit" className="mt-2 w-full" size="lg" aria-busy={isPending} disabled={isPending}>
        {isPending ? "Memproses..." : "Daftar Akun"}
      </Button>
      <div className="text-center mt-2">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </form>
  );
}
