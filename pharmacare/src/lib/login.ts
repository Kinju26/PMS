import type { LoginCredentials } from "@/types/login";

export function readLoginCredentials(form: HTMLFormElement): LoginCredentials {
  const data = new FormData(form);

  return {
    email: String(data.get("email") ?? ""),
    password: String(data.get("password") ?? ""),
    rememberWorkstation: data.get("remember-me") === "on",
  };
}
