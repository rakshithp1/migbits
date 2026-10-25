import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./product.css";
import "./community.css";
import "./library/themes.css";
import "../resources/visual/icon-motion.css";
import { SiteMotion } from "./library/site-motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Migbits — Small bits. Big personality.",
  description: "Expressive React components for websites that refuse to blend in. Explore interactive motion, playful type, and unexpected backgrounds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-mb-theme="ocean"
      data-mb-appearance="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<SiteMotion /></body>
    </html>
  );
}
