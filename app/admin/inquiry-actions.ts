"use server";

import { redirect } from "next/navigation";

import { deleteInquiry, setInquiryStatus, type InquiryStatus } from "@/lib/inquiries";
import { currentUser } from "@/lib/users";

async function staff() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function setInquiryStatusAction(formData: FormData) {
  await staff();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!Number.isInteger(id) || (status !== "read" && status !== "done" && status !== "new")) {
    redirect("/admin/inquiries");
  }
  setInquiryStatus(id, status as InquiryStatus);
  redirect(`/admin/inquiries/${id}`);
}

export async function deleteInquiryAction(formData: FormData) {
  const user = await staff();
  if (user.role !== "editor") redirect("/admin/inquiries");
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) deleteInquiry(id);
  redirect("/admin/inquiries");
}
