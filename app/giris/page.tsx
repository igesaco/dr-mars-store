import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Lock, User } from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { loginCustomerAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Üye Girişi | Dr. Mars Modern Cologne",
  description: "Dr. Mars hesabınıza giriş yapın.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm">
          <p className="eyebrow dark">DR MARS HESABIM</p>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Giriş Yap</h1>
          <p className="mt-2 text-xs text-stone-500">
            Siparişlerinizi takip etmek ve avantajlardan yararlanmak için giriş yapın.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
              E-posta adresiniz veya şifreniz hatalı. Lütfen tekrar deneyin.
            </div>
          )}

          <form action={loginCustomerAction} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                E-posta Adresi *
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="ahmet@example.com"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-stone-700">Şifre *</label>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#101e2c] py-4 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-black transition-colors"
            >
              Giriş Yap <ArrowRight size={15} />
            </button>
          </form>

          <div className="mt-8 border-t border-stone-100 pt-6 text-center text-xs text-stone-600 space-y-3">
            <p>
              Henüz bir hesabınız yok mu?{" "}
              <Link href="/kayit" className="font-bold text-stone-950 underline">
                Hemen Üye Olun
              </Link>
            </p>
            <p>
              Yönetici misiniz?{" "}
              <Link href="/yonetici-giris" className="text-stone-500 hover:text-stone-900">
                Yönetici Girişi →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
