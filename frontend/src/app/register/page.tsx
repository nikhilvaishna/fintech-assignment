"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(email.trim(), password, name.trim() || undefined);
      setUser(data.user);
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="inline-flex items-center gap-2 text-surface-600 dark:text-surface-400 mb-8">
          <span className="font-display font-semibold text-xl text-brand-600 dark:text-brand-400">Taskflow</span>
        </Link>
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl shadow-surface-200/50 dark:shadow-none p-8">
          <h1 className="font-display font-bold text-2xl text-surface-900 dark:text-white mb-1">Create account</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
            Get started with your task management.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Name (optional)
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
