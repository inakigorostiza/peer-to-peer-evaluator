"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user as
      | {
          id: string;
          email: string;
          name?: string | null;
          image?: string | null;
          role: Role;
        }
      | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
