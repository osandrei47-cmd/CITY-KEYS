import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сайт находится на реконструкции — CITY KEYS",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-white sm:text-[48px]">
        Сайт на реконструкции
      </h1>
    </main>
  );
}
