"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toggleUserVerification, deleteUser, createUserByAdmin } from "@/lib/server/user-actions";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
};

export function UserManagementClient({ initialUsers }: { initialUsers: UserType[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleToggleVerify = (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleUserVerification(userId, currentStatus);
    });
  };

  const handleDelete = (userId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
      startTransition(async () => {
        await deleteUser(userId);
      });
    }
  };

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createUserByAdmin(formData);
      if (result.success) {
        // @ts-ignore
        e.target.reset();
      } else {
        setError(result.error || "Gagal membuat pengguna");
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="p-5 xl:col-span-2">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
          <p className="text-sm text-muted-foreground">Kelola verifikasi dan hapus akun.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-transparent border-muted-foreground/30 text-foreground">{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.isVerified ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Terverifikasi</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Menunggu</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant={user.isVerified ? "outline" : "default"}
                      onClick={() => handleToggleVerify(user.id, user.isVerified)}
                      disabled={isPending}
                    >
                      {user.isVerified ? "Cabut Akses" : "Setujui"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.id)}
                      disabled={isPending}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
              {initialUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 h-fit">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Buat Akun Baru</h2>
          <p className="text-sm text-muted-foreground">Akun ini akan langsung terverifikasi.</p>
        </div>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" required placeholder="Budi Santoso" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="budi@sekolah.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} placeholder="Minimal 8 karakter" />
          </div>
          <div>
            <Label htmlFor="role">Peran (Role)</Label>
            <select
              id="role"
              name="role"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="GURU">Guru</option>
              <option value="SISWA">Siswa</option>
              <option value="KEPALA_SEKOLAH">Kepala Sekolah</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Buat Akun"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
