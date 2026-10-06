import type { Block } from "@/lib/types";

export interface OutlineItem {
  id: string;
  text: string;
}

function plain(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function headingId(index: number) {
  return `razdel-${index}`;
}

export function articleOutline(blocks: Block[]): OutlineItem[] {
  const items: OutlineItem[] = [];
  let count = 0;
  for (const block of blocks) {
    if (block.type === "h2") {
      count += 1;
      const text = block.text.trim();
      if (text) items.push({ id: headingId(count), text });
      continue;
    }
    if (block.type !== "html") continue;
    for (const match of block.html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)) {
      count += 1;
      const text = plain(match[1] ?? "");
      if (text) items.push({ id: headingId(count), text });
    }
  }
  return items;
}

export function stampHeadingIds(html: string, start = 0) {
  let count = start;
  const next = html.replace(/<h2\b([^>]*)>/gi, (_tag, attrs: string) => {
    count += 1;
    const clean = attrs.replace(/\s+id\s*=\s*(["']).*?\1/i, "");
    return `<h2 id="${headingId(count)}"${clean}>`;
  });
  return { html: next, count };
}
