"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function HomeRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/dashboard");
    else router.replace("/login");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20" />
        <p className="text-surface-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
