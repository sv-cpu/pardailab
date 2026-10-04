import { createHash, timingSafeEqual } from "node:crypto";

import { cookies, headers } from "next/headers";

import { createSessionToken, readSessionToken, sessionCookie, sessionCookieSecure, sessionMaxAge } from "@/lib/session";

export function adminCredentials() {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!user || !password || !secret) return null;
  return { user, password, secret };
}

export function secretsMatch(input: string, expected: string) {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export async function currentSession() {
  const creds = adminCredentials();
  if (!creds) return null;
  const token = (await cookies()).get(sessionCookie)?.value;
  return readSessionToken(token, creds.secret);
}

export async function startSession(user: string) {
  const creds = adminCredentials();
  if (!creds) throw new Error("Редакция не настроена.");
  const token = await createSessionToken(user, creds.secret);
  const forwardedProto = (await headers()).get("x-forwarded-proto");
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: sessionCookieSecure(forwardedProto),
    path: "/",
    maxAge: sessionMaxAge,
  });
}

export async function clearSession() {
  (await cookies()).delete(sessionCookie);
}
