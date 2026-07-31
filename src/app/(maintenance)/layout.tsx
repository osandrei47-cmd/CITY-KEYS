import { Manrope } from "next/font/google";
import "@/app/(marketing)/globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function MaintenanceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-ink font-sans">{children}</body>
    </html>
  );
}
