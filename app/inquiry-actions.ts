"use server";

import { createInquiry, readInquiry, recentInquiryCount } from "@/lib/inquiries";

export type InquiryFormState = { ok?: boolean; error?: string };

export async function submitInquiry(_state: InquiryFormState, formData: FormData): Promise<InquiryFormState> {
  const result = readInquiry({
    kind: String(formData.get("kind") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    pageTitle: String(formData.get("pageTitle") ?? ""),
    pagePath: String(formData.get("pagePath") ?? ""),
    extra: String(formData.get("contact_extra") ?? ""),
  });
  if ("drop" in result) return { ok: true };
  if ("error" in result) return { error: result.error };
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  if (recentInquiryCount(result.value.email, since) >= 5) {
    return { error: "Слишком много сообщений с этого адреса. Напишите позже." };
  }
  createInquiry(result.value);
  return { ok: true };
}
