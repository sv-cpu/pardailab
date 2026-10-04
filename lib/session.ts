export const sessionCookie = "pardai_session";
export const sessionMaxAge = 60 * 60 * 24 * 7;

/** Secure only when the client connection is HTTPS, including via a reverse proxy. */
export function sessionCookieSecure(forwardedProto: string | null) {
  return forwardedProto?.split(",")[0]?.trim() === "https";
}

type SessionPayload = { user: string; exp: number };

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function signature(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signed));
}

function sameText(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index]! ^ b[index]!;
  return diff === 0;
}

export async function createSessionToken(user: string, secret: string, now = Date.now()) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ user, exp: now + sessionMaxAge * 1000 } satisfies SessionPayload)),
  );
  return `${payload}.${await signature(payload, secret)}`;
}

export async function readSessionToken(token: string | undefined, secret: string | undefined, now = Date.now()) {
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await signature(payload, secret);
  if (!sameText(sig, expected)) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as SessionPayload;
    if (typeof parsed.user !== "string" || typeof parsed.exp !== "number" || parsed.exp <= now) return null;
    return parsed;
  } catch {
    return null;
  }
}
