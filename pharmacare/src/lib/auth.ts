export { SESSION_COOKIE as sessionCookieName } from "@/lib/auth/constants";
export type { SessionUser } from "@/lib/auth/types";

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "PC";
}
