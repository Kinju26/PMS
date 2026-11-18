export const sessionCookieName = "pharmacare.session";

const accountsKey = "pharmacare.accounts";

export type SessionUser = {
  name: string;
  email: string;
};

type StoredAccount = SessionUser & {
  passwordHash: string;
};

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/**
 * Pure-JS FIPS 180-4 SHA-256 fallback used when Web Crypto (`crypto.subtle`)
 * is unavailable (e.g., accessing the app over plain HTTP via a LAN IP on Android Chrome).
 * Produces the exact same 64-char hex digest as `crypto.subtle.digest("SHA-256", data)`.
 */
function sha256Fallback(bytes: Uint8Array): string {
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 =
        ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
        ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^
        (w[i - 15] >>> 3);
      const s1 =
        ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
        ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^
        (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}

export function encodeSession(user: SessionUser) {
  const bytes = new TextEncoder().encode(JSON.stringify(user));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodeSession(value: string | undefined | null): SessionUser | null {
  if (!value) return null;
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as { name?: unknown; email?: unknown };
    if (typeof record.name !== "string" || typeof record.email !== "string") return null;
    const name = record.name.trim();
    const email = record.email.trim().toLowerCase();
    if (name.length < 2 || !email.includes("@")) return null;
    return { name, email };
  } catch {
    return null;
  }
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "PC";
}

export async function hashPassword(password: string, email: string) {
  const data = new TextEncoder().encode(`${email.trim().toLowerCase()}::${password}`);
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    try {
      const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fall back to pure-JS SHA-256 if Web Crypto fails in restricted contexts
    }
  }
  return sha256Fallback(data);
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(accountsKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StoredAccount => {
      if (!item || typeof item !== "object") return false;
      const account = item as StoredAccount;
      return (
        typeof account.email === "string" &&
        typeof account.name === "string" &&
        typeof account.passwordHash === "string"
      );
    });
  } catch {
    return [];
  }
}

export function findAccount(email: string) {
  const key = email.trim().toLowerCase();
  return readAccounts().find((account) => account.email === key) ?? null;
}

export function saveAccount(account: StoredAccount) {
  const accounts = readAccounts().filter((item) => item.email !== account.email);
  accounts.push(account);
  window.localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

export function writeSessionCookie(user: SessionUser): boolean {
  const encoded = encodeSession(user);
  document.cookie = `${sessionCookieName}=${encoded}; Path=/; Max-Age=604800; SameSite=Lax`;
  return document.cookie.includes(`${sessionCookieName}=`);
}

export function clearSessionCookie() {
  document.cookie = `${sessionCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
}
