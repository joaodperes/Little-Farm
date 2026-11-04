import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Little Farm — Offline Browser Farm Simulator",
  description: "Grow crops, raise animals and manage your farm. Saves automatically on your own device.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">{children}<Toaster richColors position="top-center" /></body>
    </html>
  );
}
