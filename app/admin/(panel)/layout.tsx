import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/shell";
import { currentUser, roleLabel } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  return (
    <AdminShell role={user.role} account={{ name: user.name, roleLabel: roleLabel[user.role], photo: user.photo }}>
      {children}
    </AdminShell>
  );
}
