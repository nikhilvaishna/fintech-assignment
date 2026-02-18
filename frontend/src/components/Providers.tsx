"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
          },
        }}
      />
    </AuthProvider>
  );
}
