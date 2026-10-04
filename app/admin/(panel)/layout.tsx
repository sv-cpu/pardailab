import { redirect } from "next/navigation";

import { currentSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await currentSession())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
