import { InquiryTable } from "@/components/admin/inquiry-table";
import { formatPublished } from "@/lib/format";
import { inquiryFolder, inquiryPreview, type InquiryListRow } from "@/lib/inquiry-list";
import { inquiryKindLabel, listInquiries } from "@/lib/inquiries";

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ folder?: string }> }) {
  const query = await searchParams;
  const folder = inquiryFolder(query.folder);
  const rows: InquiryListRow[] = listInquiries().map((item) => ({
    id: item.id,
    kind: item.kind,
    kindLabel: inquiryKindLabel[item.kind],
    name: item.name,
    email: item.email,
    preview: inquiryPreview(item.message),
    pageTitle: item.pageTitle,
    pagePath: item.pagePath,
    status: item.status,
    important: item.important,
    dateLabel: formatPublished(item.createdAt),
    searchText: `${item.name} ${item.email} ${item.message} ${item.pageTitle}`,
  }));
  return <InquiryTable key={folder} rows={rows} initialFolder={folder} />;
}
