import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "HyperLiquid Markets",
    description: "Trading PWA built with Next.js",
    manifest: "/manifest.json", // ✅ 自动注入 manifest.json
    themeColor: "#000000",
    icons: {
        icon: "/icons/icon-192x192.png",      // 普通 favicon
        shortcut: "/icons/icon-192x192.png",  // 浏览器快捷图标
        apple: "/icons/icon-512x512.png",     // iOS 桌面图标
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
