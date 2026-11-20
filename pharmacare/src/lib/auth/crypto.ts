import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function digestEqual(a: string, b: string) {
  return safeEqual(sha256Hex(a), sha256Hex(b));
}

export function hmacSign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}
