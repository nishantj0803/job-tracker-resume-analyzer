// File: components/nextauth-session-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type React from "react";

interface NextAuthSessionProviderProps {
  children: React.ReactNode;
}

export default function NextAuthSessionProvider({ children }: NextAuthSessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
