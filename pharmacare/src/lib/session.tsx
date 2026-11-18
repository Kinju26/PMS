"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({ session, children }: { session: SessionUser; children: ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("Signed-in session is missing.");
  }
  return session;
}
