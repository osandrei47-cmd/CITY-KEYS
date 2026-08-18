import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SITE_URL } from "@/lib/feed/constants";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const TITLE = "CITY KEYS — агентство недвижимости в Кингисеппе";
const DESCRIPTION =
  "25 лет в недвижимости. Одну сделку веду от первого звонка до ключей лично — сам, а не через сменяющихся менеджеров.";

export const metadata: Metadata = {
  // Без этого relative-пути в openGraph/twitter images (везде на сайте)
  // не могут собраться в абсолютный URL — Next.js упадёт с ошибкой сборки.
  // См. docs/seo-audit-2026-08-18.md, п.9.
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // Общий запасной OG/Twitter — применяется только к страницам, которые
  // не задают свой openGraph/twitter явно (см. buildOpenGraph в lib/seo.ts
  // про то, почему это не наследуется автоматически по отдельным полям).
  openGraph: buildOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/" }),
  twitter: buildTwitter({ title: TITLE, description: DESCRIPTION }),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
