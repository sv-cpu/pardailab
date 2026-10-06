import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "PardAiLab — практический искусственный интеллект";
export const size = ogSize;
export const contentType = ogContentType;
export const runtime = "nodejs";

export default function Image() {
  return renderOg("ЛАБОРАТОРИЯ", "Практический искусственный интеллект для людей и бизнеса");
}
