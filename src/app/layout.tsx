import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Little Farm — Offline Browser Farm Simulator",
  description: "Grow crops, raise animals and manage your farm. Saves automatically on your own device.",
};

const themeInit = `(function(){try{var choice=localStorage.getItem("little-farm-theme");var dark=choice==="dark"||(choice!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body className="antialiased bg-background text-foreground">{children}<Toaster richColors position="top-center" /></body>
    </html>
  );
}
