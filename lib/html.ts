import sanitizeHtml from "sanitize-html";

import type { Block } from "@/lib/types";

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  "img",
  "h2",
  "h3",
  "h4",
  "figure",
  "figcaption",
  "iframe",
  "aside",
  "hr",
  "sup",
  "sub",
];

function safeUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return trimmed;
  } catch {
    return "";
  }
  return "";
}

export function sanitizeArticleHtml(source: string) {
  return sanitizeHtml(source, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": [],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          href: safeUrl(attribs.href ?? ""),
          rel: "noopener noreferrer",
        },
      }),
      iframe: (tagName, attribs) => ({
        tagName,
        attribs: {
          src: attribs.src ?? "",
          width: attribs.width ?? "560",
          height: attribs.height ?? "315",
          title: attribs.title ?? "Встроенный материал",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
        },
      }),
    },
  }).trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function blocksToHtml(blocks: Block[]) {
  return blocks
    .map((block) => {
      if (block.type === "html") return block.html;
      if (block.type === "h2") return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === "ul") return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      if (block.type === "ol") return `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
      if (block.type === "note") {
        return `<aside><p><strong>${escapeHtml(block.title)}</strong></p><p>${escapeHtml(block.text)}</p></aside>`;
      }
      return `<p>${escapeHtml(block.text)}</p>`;
    })
    .join("\n");
}
