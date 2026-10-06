import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const publicPrefix = "/uploads/avatars/";
const maxBytes = 8 * 1024 * 1024;

export function isStoredAvatar(value: string) {
  return /^\/uploads\/avatars\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value);
}

function extension(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function storeAvatar(file: File) {
  if (file.size <= 0) throw new Error("Файл фото пустой.");
  if (file.size > maxBytes) throw new Error("Фото больше 8 МБ.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extension(bytes);
  if (!ext) throw new Error("Фото — файл JPEG, PNG или WebP.");
  const name = `${randomUUID()}.${ext}`;
  const directory = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return `${publicPrefix}${name}`;
}

export async function removeAvatar(url: string | undefined) {
  if (!url || !isStoredAvatar(url)) return;
  const name = path.basename(url);
  await unlink(path.join(process.cwd(), "public", "uploads", "avatars", name)).catch(() => undefined);
}
