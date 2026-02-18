"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/api";
import { authApi } from "@/lib/api";

type AuthState = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const userStored = authApi.getStoredUser?.() ?? null;
    if (userStored) setUser(userStored);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
