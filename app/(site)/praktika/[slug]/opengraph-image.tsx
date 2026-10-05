import { articleOg, ogContentType, ogSize } from "@/lib/og";

export const alt = "Практика PardAiLab";
export const size = ogSize;
export const contentType = ogContentType;
export const runtime = "nodejs";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleOg("practice", slug);
}
