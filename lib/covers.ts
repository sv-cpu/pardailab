import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const publicPrefix = "/uploads/covers/";
const maxBytes = 8 * 1024 * 1024;

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type CoverType = keyof typeof extensions;

export function coversDirectory() {
  return path.join(process.cwd(), "public", "uploads", "covers");
}

export function isStoredCover(value: string) {
  return /^\/uploads\/covers\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value);
}

function sniff(bytes: Buffer, type: string): CoverType | null {
  if (type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (type === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (
    type === "image/webp" &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function storeCover(file: File) {
  if (file.size <= 0) throw new Error("Файл обложки пустой.");
  if (file.size > maxBytes) throw new Error("Обложка больше 8 МБ.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = sniff(bytes, file.type);
  if (!type) throw new Error("Обложка — файл JPEG, PNG или WebP.");
  const name = `${randomUUID()}.${extensions[type]}`;
  const directory = coversDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return `${publicPrefix}${name}`;
}

export async function removeCover(url: string | undefined) {
  if (!url || !isStoredCover(url)) return;
  const name = url.slice(publicPrefix.length);
  await unlink(path.join(coversDirectory(), name)).catch(() => undefined);
}
