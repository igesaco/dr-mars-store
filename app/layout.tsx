import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dr Mars | Haute Parfumerie & Modern Kolonya",
  description: "Mardin OSB laboratuvarlarında üretilen doğal akik taşlı kolonya ve niş parfümler.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={plusJakarta.variable}>
      <body className="antialiased font-sans bg-[#fbfaf8] text-[#111620]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
