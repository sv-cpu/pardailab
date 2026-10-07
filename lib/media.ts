import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { imageMaxBytes, isStoredMedia, mediaUrlsInHtml, videoMaxBytes } from "@/lib/media-path";
import type { Block } from "@/lib/types";

const publicPrefix = "/uploads/media/";

export type StoredMedia = { url: string; kind: "image" | "video" };

type MediaExt = "jpg" | "png" | "webp" | "gif" | "mp4" | "webm";

export function mediaDirectory() {
  return path.join(process.cwd(), "public", "uploads", "media");
}

export function detectMedia(bytes: Buffer): { kind: "image" | "video"; ext: MediaExt } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { kind: "image", ext: "jpg" };
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { kind: "image", ext: "png" };
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { kind: "image", ext: "webp" };
  }
  const gif = bytes.subarray(0, 6).toString("ascii");
  if (gif === "GIF87a" || gif === "GIF89a") return { kind: "image", ext: "gif" };
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    if (bytes.subarray(0, 128).toString("latin1").includes("webm")) return { kind: "video", ext: "webm" };
  }
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp") return { kind: "video", ext: "mp4" };
  return null;
}

export function mediaUrlsInBody(body: Block[]) {
  const found: string[] = [];
  for (const block of body) {
    if (block.type !== "html") continue;
    for (const url of mediaUrlsInHtml(block.html)) {
      if (!found.includes(url)) found.push(url);
    }
  }
  return found;
}

export async function storeArticleMedia(file: File): Promise<StoredMedia> {
  if (file.size <= 0) throw new Error("Файл пустой.");
  if (file.size > videoMaxBytes) throw new Error("Файл больше 12 МБ. Изображение — до 8 МБ, видео — до 12 МБ.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectMedia(bytes);
  if (!detected) throw new Error("Нужен файл JPEG, PNG, WebP, GIF, MP4 или WebM.");
  if (detected.kind === "image" && bytes.length > imageMaxBytes) throw new Error("Изображение больше 8 МБ.");
  const name = `${randomUUID()}.${detected.ext}`;
  const directory = mediaDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return { url: `${publicPrefix}${name}`, kind: detected.kind };
}

export async function removeArticleMedia(url: string) {
  if (!isStoredMedia(url)) return;
  const name = url.slice(publicPrefix.length);
  await unlink(path.join(mediaDirectory(), name)).catch(() => undefined);
}

export async function dropRemovedMedia(previous: Block[], next: Block[]) {
  const kept = new Set(mediaUrlsInBody(next));
  for (const url of mediaUrlsInBody(previous)) {
    if (!kept.has(url)) await removeArticleMedia(url);
  }
}
