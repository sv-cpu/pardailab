"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { inquiryFolder } from "@/lib/inquiry-list";
import { deleteInquiry, setInquiryImportant, setInquiryStatus, type InquiryStatus } from "@/lib/inquiries";
import { currentUser } from "@/lib/users";

async function staff() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  return user;
}

function refreshInquiries() {
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function patchInquiryAction(
  id: number,
  patch: { status?: InquiryStatus; important?: boolean },
): Promise<{ ok: true } | { ok: false }> {
  await staff();
  if (!Number.isInteger(id) || id < 1) return { ok: false };
  if (patch.status) {
    if (patch.status !== "new" && patch.status !== "read" && patch.status !== "archive") return { ok: false };
    setInquiryStatus(id, patch.status);
  }
  if (typeof patch.important === "boolean") setInquiryImportant(id, patch.important);
  refreshInquiries();
  return { ok: true };
}

export async function deleteInquiryAction(formData: FormData) {
  const user = await staff();
  const from = inquiryFolder(String(formData.get("from") ?? ""));
  if (user.role !== "editor") redirect(from === "new" ? "/admin/inquiries" : `/admin/inquiries?folder=${from}`);
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) deleteInquiry(id);
  refreshInquiries();
  redirect(from === "new" ? "/admin/inquiries" : `/admin/inquiries?folder=${from}`);
}
