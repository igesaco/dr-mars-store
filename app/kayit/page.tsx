import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { registerCustomerAction } from "@/app/giris/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Üyelik | Dr. Mars Modern Cologne",
  description: "Dr. Mars ailesine katılın, siparişlerinizi kolayca yönetin.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
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
          <p className="eyebrow dark">YENİ ÜYELİK</p>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Hesap Oluştur</h1>
          <p className="mt-2 text-xs text-stone-500">
            Kayıt olun, teslimat adreslerinizi kaydedin ve siparişlerinizi anlık takip edin.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={registerCustomerAction} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ad *</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="Ahmet"
                  className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soyad *</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Yılmaz"
                  className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">E-posta Adresi *</label>
              <input
                name="email"
                type="email"
                required
                placeholder="ahmet@example.com"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Telefon Numarası</label>
              <input
                name="phone"
                type="tel"
                placeholder="0532 123 45 67"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Şifre * (En az 6 karakter)</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" id="kvkk" required className="mt-1 h-4 w-4 rounded" />
              <label htmlFor="kvkk" className="text-[11px] text-stone-600">
                <Link href="/kvkk" target="_blank" className="font-bold underline text-stone-900">
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#101e2c] py-4 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-black transition-colors"
            >
              Kayıt Ol <ArrowRight size={15} />
            </button>
          </form>

          <div className="mt-8 border-t border-stone-100 pt-6 text-center text-xs text-stone-600">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/giris" className="font-bold text-stone-950 underline">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
