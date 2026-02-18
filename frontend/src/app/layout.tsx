import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taskflow — Task Management",
  description: "Manage your tasks with a clean, fast interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
