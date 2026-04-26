import { PageHeader } from "@/components/page-header";
import { getUsers } from "@/lib/server/user-actions";
import { UserManagementClient } from "./user-management-client";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Administrator"
        title="Manajemen Pengguna"
        description="Kelola akun Guru, Kepala Sekolah, dan Siswa."
        icon="users"
      />
      
      <UserManagementClient initialUsers={users} />
    </div>
  );
}
