import type { LoginCredentials } from "@/types/login";

export function readLoginCredentials(form: HTMLFormElement): LoginCredentials {
  const data = new FormData(form);

  return {
    adminId: String(data.get("admin-id") ?? ""),
    password: String(data.get("password") ?? ""),
  };
}
