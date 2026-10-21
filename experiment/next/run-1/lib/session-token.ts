// 署名つきセッショントークン。proxy.ts と API の両方で使うため、Web Crypto だけで実装する。
// トークンの形式: base64url(JSON) + "." + base64url(HMAC-SHA256)

import type { Role } from "./types";

export const SESSION_COOKIE = "kintai_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type SessionPayload = {
  uid: string;
  role: Role;
  /** 有効期限（UNIX 秒） */
  exp: number;
};

const DEV_SECRET = "dev-only-session-secret-change-me-in-production";

function getSecret(): string {
  return process.env.SESSION_SECRET || DEV_SECRET;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/** 署名と有効期限を確かめる。不正・期限切れなら null。 */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await getKey(), fromBase64Url(sig), encoder.encode(body));
    if (!valid) return null;
    const payload = JSON.parse(decoder.decode(fromBase64Url(body))) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.role !== "admin" && payload.role !== "employee") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
