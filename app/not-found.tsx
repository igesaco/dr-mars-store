import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass, Home, MessageCircle, PackageSearch, Search } from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı · 404 | Dr. Mars Haute Parfumerie",
  description: "Aradığınız sayfa veya koku koleksiyonu bulunamadı.",
};

export default async function NotFound() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement =
    (typeof settings.announcement === "object" && settings.announcement !== null && "text" in settings.announcement
      ? String(settings.announcement.text)
      : null) ?? "MARDİN OSB LABORATUVARLARINDAN · 1.500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#0b1724] flex flex-col justify-between">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28 text-center flex-1 flex flex-col items-center justify-center">
        {/* Lüks 404 Numarası */}
        <div className="relative mb-6 select-none">
          <span className="text-8xl sm:text-9xl font-serif font-black tracking-widest text-[#0e131a]/10 block">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-serif text-[#91754f] italic">
            Sayfa Bulunamadı
          </span>
        </div>

        {/* Bilgilendirme Metni */}
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#8f7351] mb-2">
          HAUTE PARFUMERIE · MARDİN
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#0e131a] font-normal mb-4">
          Aradığınız Koku veya Sayfa Mevcut Değil
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-8">
          Ulaşmaya çalıştığınız sayfa adresi değişmiş, kaldırılmış veya yanlış yazılmış olabilir.
          Dr. Mars imza koleksiyonlarını keşfetmeye devam edebilirsiniz.
        </p>

        {/* Hızlı Aksiyon Butonları */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link
            href="/"
            className="rounded-full bg-[#0e131a] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#dfcca8] hover:bg-[#c5a880] hover:text-[#0e131a] transition-all flex items-center gap-2 shadow-sm"
          >
            <Home size={15} />
            <span>Anasayfaya Dön</span>
          </Link>

          <Link
            href="/#urunler"
            className="rounded-full border border-stone-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-800 hover:border-stone-900 transition-all flex items-center gap-2 shadow-2xs"
          >
            <Compass size={15} />
            <span>Tüm Koleksiyon</span>
          </Link>

          <Link
            href="/siparis-takip"
            className="rounded-full border border-stone-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-800 hover:border-stone-900 transition-all flex items-center gap-2 shadow-2xs"
          >
            <PackageSearch size={15} />
            <span>Sipariş Takibi</span>
          </Link>

          <a
            href="https://wa.me/904822121903?text=Merhaba%2C%20Dr.%20Mars%20sitesinde%20aradığım%20ürünü%20bulamadım."
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-emerald-700 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-800 transition-all flex items-center gap-2 shadow-sm"
          >
            <MessageCircle size={15} />
            <span>WhatsApp Destek</span>
          </a>
        </div>

        {/* Popüler Kategori Kısayolları */}
        <div className="border-t border-stone-200/80 pt-8 w-full max-w-lg">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 block mb-3">
            Popüler Koleksiyonlar
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-stone-700">
            <Link
              href="/kategori/kolonyalar"
              className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 transition-colors"
            >
              🌿 Kolonyalar
            </Link>
            <Link
              href="/kategori/oda-kokulari"
              className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 transition-colors"
            >
              🏠 Oda Kokuları
            </Link>
            <Link
              href="/kategori/oto-kokulari"
              className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 transition-colors"
            >
              🚗 Oto Kokuları
            </Link>
            <Link
              href="/kategori/parfumler"
              className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 transition-colors"
            >
              💎 Parfümler
            </Link>
            <Link
              href="/kategori/hediye-setleri"
              className="rounded-lg bg-stone-100 px-3 py-1.5 hover:bg-stone-200 transition-colors"
            >
              🎁 Hediye Setleri
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
