import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Award,
  Compass,
  Droplet,
  FlaskConical,
  Gem,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hakkımızda & Hikayemiz | Dr. Mars Parfümeri & Kolonya",
  description:
    "Kimya Mühendisi Hamdullah Adsoy tarafından Mardin'de kurulan Dr. Mars; Mezopotamya'nın koku mirasını, doğal akik taşı kreasyonlarını ve modern kozmetik bilimini buluşturuyor.",
};

export default async function AboutPage() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement =
    settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      {/* Hero Intro */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e8ede3] to-[#f5f4ee] px-6 py-24 md:px-[10vw] border-b border-stone-200">
        <div className="max-w-4xl">
          <p className="eyebrow dark">
            <Sparkles size={14} /> KİMYA MÜHENDİSLİĞİNDEN KOKU SANATINA
          </p>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl text-stone-950">
            Mezopotamya&apos;nın kadim mirası,{" "}
            <span className="font-serif italic font-normal text-stone-700">
              bilim ve zarafetle
            </span>{" "}
            şişelendi.
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-stone-600 leading-relaxed">
            Mardinli <strong>Kimya Mühendisi Hamdullah Adsoy</strong> tarafından kurulan{" "}
            <strong>Dr. Mars Parfümeri</strong>; binlerce yıllık koku kültürünü, yeryüzünün şifalı akik ve kuvars taşlarını, ileri laboratuvar teknolojisi ve %80 doğal alkollü ferahlıkla yeniden tanımlayan özgün bir koku evidir.
          </p>
        </div>
      </section>

      {/* Story & Heritage Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-mono font-black text-[#849649] tracking-widest uppercase">
            MARDİN&apos;DEN DÜNYAYA UZANAN VİZYON
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Tarihi Taş Konaklardan Modern Üretim Tesisine
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Dr. Mars yolculuğu, kadim medeniyetlerin beşiği Mardin&apos;in bin yıllık tarihi 1. Caddesi&apos;nde başladı. Taş konakların, badem çiçeklerinin ve rüzgarın taşıdığı narenciye kokularının arasında filizlenen bu tutku, kurucumuz Hamdullah Adsoy&apos;un kimya mühendisliği formasyonu ile profesyonel bir kozmetik laboratuvarına dönüştü.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            Bugün, <strong>Mardin Organize Sanayi Bölgesi&apos;ndeki (OSB)</strong> modern tesislerimizde Avrupa standartlarında (ISO 9001 ve GMP İyi Üretim Uygulamaları) üretilen Dr. Mars kolonya ve parfümleri; Türkiye&apos;nin dört bir yanındaki seçkin bayilikler ve dijital mağazamız aracılığıyla binlerce koku tutkununa ulaşıyor.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <span className="block text-2xl font-black text-stone-900">65+</span>
              <span className="text-xs font-bold text-stone-500">Özel Koku Kreasyonu</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <span className="block text-2xl font-black text-stone-900">%80</span>
              <span className="text-xs font-bold text-stone-500">Doğal Etil Alkol Bazı</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <span className="block text-2xl font-black text-stone-900">GMP & ISO</span>
              <span className="text-xs font-bold text-stone-500">Uluslararası Sertifikasyon</span>
            </div>
          </div>
        </div>

        {/* Highlight Card */}
        <div className="rounded-3xl bg-[#101e2c] text-white p-8 sm:p-12 shadow-xl space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#caff73] text-[#101e2c]">
            <Gem size={32} />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            Türkiye&apos;de Bir İlk: Doğal Akik Taşlı Kolonya
          </h3>
          <p className="text-sm text-stone-300 leading-relaxed">
            Dr. Mars&apos;ın patentli ve tescilli yeniliklerinden biri olan <strong>Akik Taşı ve Pembe Kuvars Parçacıklı Kolonya Serisi</strong>; yeryüzünün milyonlarca yılda kristalleşen pozitif mineral enerjisini, teninizde gün boyu süren ferah bir zarafetle birleştirir.
          </p>
          <div className="space-y-3 pt-2 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <Droplet size={16} className="text-[#caff73]" />
              <span>Tortu bırakmayan, şeffaf ve saf esansiyel yağ dengesi</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical size={16} className="text-[#caff73]" />
              <span>Dermatolojik olarak test edilmiş, ten dostu formülasyon</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[#caff73]" />
              <span>Mardin Kalesi, Deyrulzafaran ve Mezopotamya tematik koku piramitleri</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 bg-white border-y border-stone-200">
        <div className="p-10 sm:p-14">
          <span className="text-xs font-mono font-black text-[#849649] tracking-widest uppercase">
            01 / BİLİM VE DOĞALLIK
          </span>
          <h3 className="mt-8 text-2xl font-black tracking-tight text-stone-900">
            Mühendislik Hassasiyeti
          </h3>
          <p className="mt-4 text-sm text-stone-600 leading-relaxed">
            Tüm formüllerimiz, Kimya Mühendisi kurucumuzun gözetiminde IFRA (International Fragrance Association) rehberliğinde geliştirilir. Ağır kimyasal içermeyen, baş ağrıtmayan, temiz ve dengeli notalar üretilir.
          </p>
        </div>

        <div className="p-10 sm:p-14">
          <span className="text-xs font-mono font-black text-[#849649] tracking-widest uppercase">
            02 / KÜLTÜREL KOKU MİRASI
          </span>
          <h3 className="mt-8 text-2xl font-black tracking-tight text-stone-900">
            Yöresel & İkonik Notalar
          </h3>
          <p className="mt-4 text-sm text-stone-600 leading-relaxed">
            Zeytin çiçeği, tütün, incir, badem, safran ve Akdeniz bergamotu; Mardin&apos;in bin yıllık misafirperverlik ritüelini modern sofralara ve evlere taşır.
          </p>
        </div>

        <div className="p-10 sm:p-14">
          <span className="text-xs font-mono font-black text-[#849649] tracking-widest uppercase">
            03 / PREMİUM AMBALAJ & SUNUM
          </span>
          <h3 className="mt-8 text-2xl font-black tracking-tight text-stone-900">
            Lüks Hediye Deneyimi
          </h3>
          <p className="mt-4 text-sm text-stone-600 leading-relaxed">
            Özel tasarım cam şişeler, altın detaylı püskürtücüler ve darbeye dayanıklı lüks kutular sayesinde her Dr. Mars ürünü unutulmaz bir hediye niteliği taşır.
          </p>
        </div>
      </section>

      {/* Production & Showroom Locations */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-black text-[#849649] tracking-widest uppercase">
            LOKASYONLARIMIZ
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-stone-900">
            Bizi Ziyaret Edin
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-stone-900">
              <MapPin className="text-[#849649]" size={24} />
              <div>
                <h3 className="text-lg font-black">Tarihi Butik Showroom</h3>
                <p className="text-xs text-stone-500">Mardin Merkez Mağaza</p>
              </div>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Şar Mahallesi, 1. Cadde No: 284, 47100 Artuklu / Mardin
            </p>
            <p className="text-xs text-stone-500">
              Mardin&apos;in tarihi dokusunda tüm koku koleksiyonlarımızı ve akik taşlı özel serilerimizi deneyimleyin.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-stone-900">
              <FlaskConical className="text-[#849649]" size={24} />
              <div>
                <h3 className="text-lg font-black">Üretim Tesisi & Ar-Ge Laboratuvarı</h3>
                <p className="text-xs text-stone-500">Mardin Organize Sanayi Bölgesi</p>
              </div>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Mardin OSB 2. Cadde No: 14, Artuklu / Mardin
            </p>
            <p className="text-xs text-stone-500">
              İleri teknoloji dolum hatları, kalite kontrol ve formülasyon laboratuvarımız.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & CTA Strip */}
      <section className="flex flex-col gap-10 bg-[#101e2c] px-6 py-20 text-white md:flex-row md:items-center md:justify-between md:px-[10vw]">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-[#caff73]" />
            <h2 className="text-2xl font-bold">Sağlık Bakanlığı Bildirimli & Lisanslı</h2>
          </div>
          <p className="text-sm text-stone-300 max-w-md leading-relaxed">
            Tüm ürünlerimiz T.C. Sağlık Bakanlığı Ürün Takip Sistemi (ÜTS) kayıtlı ve uluslararası GMP kalite standartlarına tam uyumludur.
          </p>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Truck size={28} className="text-[#caff73]" />
            <h2 className="text-2xl font-bold">Türkiye Geneli Hızlı Kargo</h2>
          </div>
          <p className="text-sm text-stone-300 max-w-md leading-relaxed">
            1500 TL ve üzeri siparişlerde kargo ücretsiz, özenli darbe koruyucu ambalaj.
          </p>
        </div>

        <Link
          href="/kategori/kolonyalar"
          className="flex items-center gap-2 self-start rounded-lg bg-[#caff73] px-6 py-4 text-xs font-black uppercase tracking-wider text-[#101e2c] hover:bg-white transition-colors shrink-0"
        >
          Koleksiyonu Keşfet <ArrowUpRight size={18} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
