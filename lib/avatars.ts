import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const publicPrefix = "/uploads/avatars/";
const maxBytes = 8 * 1024 * 1024;

export function isStoredAvatar(value: string) {
  return /^\/uploads\/avatars\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value);
}

function extension(bytes: Buffer, type: string) {
  if (type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (type === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (type === "image/webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF") return "webp";
  return null;
}

export async function storeAvatar(file: File) {
  if (file.size <= 0) throw new Error("Файл фото пустой.");
  if (file.size > maxBytes) throw new Error("Фото больше 8 МБ.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extension(bytes, file.type);
  if (!ext) throw new Error("Фото — файл JPEG, PNG или WebP.");
  const name = `${randomUUID()}.${ext}`;
  const directory = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return `${publicPrefix}${name}`;
}

export async function removeAvatar(url: string | undefined) {
  if (!url || !isStoredAvatar(url)) return;
  await unlink(path.join(process.cwd(), "public", url)).catch(() => undefined);
}
