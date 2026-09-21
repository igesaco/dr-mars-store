import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Compass,
  Droplet,
  Factory,
  FlaskConical,
  Gem,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CologneHeroAnimation } from "@/components/storefront/cologne-hero-animation";
import { IntroCinematic } from "@/components/storefront/intro-cinematic";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hakkımızda & Kurumsal | Dr. Mars Haute Parfumerie Mardin",
  description:
    "Mardin OSB yüksek teknoloji laboratuvarlarımız, GMP ve ISO sertifikalı üretim altyapımız, kurumsal değerlerimiz ve kalite standartlarımız.",
};

export default async function AboutPage() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement =
    (typeof settings.announcement === "object" && settings.announcement !== null && "text" in settings.announcement
      ? String(settings.announcement.text)
      : null) ?? "MARDİN OSB LABORATUVARLARINDAN · 1.500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#0b1724]">
      {/* Sinematik Tanıtım Deneyimi */}
      <IntroCinematic />

      {/* Üst Menü */}
      <Header categories={navCategories} announcementText={announcement} />

      {/* Lüks Flakon Kolonya İnteraktif Görsel & Laboratuvar Hero Deneyimi */}
      <section className="relative">
        <CologneHeroAnimation />
      </section>

      {/* Kurumsal Güvence & İnovasyon Sütunları */}
      <section className="w-full border-y border-[#e7e3d8] bg-white py-12 px-6 sm:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#f0ece3] bg-[#faf8f5]/80 hover:border-[#c5a880]/50 transition-colors shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0e131a] text-[#c5a880]">
              <FlaskConical size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-950">
                Kimya Mühendisliği
              </h3>
              <p className="mt-1.5 text-[11.5px] text-stone-600 leading-relaxed">
                Kurucumuz <strong>Hamdullah Adsoy</strong> liderliğinde %80 saflaştırılmış etil alkol ve stabil moleküler formülasyon.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#f0ece3] bg-[#faf8f5]/80 hover:border-[#c5a880]/50 transition-colors shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0e131a] text-[#c5a880]">
              <Gem size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-950">
                Hakiki Akik Taşı
              </h3>
              <p className="mt-1.5 text-[11.5px] text-stone-600 leading-relaxed">
                Şişe içerisinde negatif enerjiyi nötralize eden ve koku esansını dinlendiren tescilli doğal mineral kristalleri.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#f0ece3] bg-[#faf8f5]/80 hover:border-[#c5a880]/50 transition-colors shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0e131a] text-[#c5a880]">
              <Factory size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-950">
                Mardin OSB Fabrikası
              </h3>
              <p className="mt-1.5 text-[11.5px] text-stone-600 leading-relaxed">
                Organize Sanayi Bölgesi yüksek teknoloji tesislerimizde tam otomasyonlu, el değmeden steril dolum ve paketleme.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#f0ece3] bg-[#faf8f5]/80 hover:border-[#c5a880]/50 transition-colors shadow-xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0e131a] text-[#c5a880]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-950">
                Sağlık Bakanlığı & GMP
              </h3>
              <p className="mt-1.5 text-[11.5px] text-stone-600 leading-relaxed">
                T.C. Sağlık Bakanlığı ÜTS tam kaydı ve uluslararası ISO 9001, ISO 22716 kozmetik standartlarına tam uyum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story & Heritage Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/40 bg-[#c5a880]/10 px-3.5 py-1 text-xs font-bold tracking-widest text-[#8f7351] uppercase">
            <Sparkles size={13} /> MARDİN&apos;DEN DÜNYAYA UZANAN VİZYON
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold text-stone-900 tracking-tight leading-tight">
            Tarihi Taş Konaklardan Modern Üretim Tesisine
          </h2>
          <p className="text-base text-stone-600 leading-relaxed">
            Dr. Mars yolculuğu, kadim medeniyetlerin beşiği Mardin&apos;in bin yıllık tarihi 1. Caddesi&apos;nde başladı. Taş konakların, badem çiçeklerinin ve rüzgarın taşıdığı narenciye kokularının arasında filizlenen bu tutku, kurucumuz <strong>Kimya Mühendisi Hamdullah Adsoy</strong>&apos;un bilimsel formasyonu ile yüksek teknolojili bir kozmetik laboratuvarına dönüştü.
          </p>
          <p className="text-base text-stone-600 leading-relaxed">
            Bugün, <strong>Mardin Organize Sanayi Bölgesi&apos;ndeki (OSB)</strong> modern tesislerimizde Avrupa standartlarında (ISO 9001 ve GMP İyi Üretim Uygulamaları) üretilen Dr. Mars kolonya ve parfümleri; Türkiye&apos;nin dört bir yanındaki seçkin bayilikler ve dijital mağazamız aracılığıyla binlerce koku tutkununa ulaşıyor.
          </p>

          <div className="pt-4 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs text-center">
              <span className="block text-3xl font-black text-stone-950">65+</span>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-1 block">Özel Formül</span>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs text-center">
              <span className="block text-3xl font-black text-stone-950">%80</span>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-1 block">Doğal Etil Alkol</span>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs text-center">
              <span className="block text-3xl font-black text-stone-950">GMP</span>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-1 block">Sertifikalı</span>
            </div>
          </div>
        </div>

        {/* Highlight Akik Card */}
        <div className="rounded-3xl bg-[#0c1117] border border-[#c5a880]/30 text-white p-8 sm:p-12 shadow-2xl space-y-7 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#c5a880]/10 blur-3xl pointer-events-none" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c5a880] text-[#0a0e14] shadow-lg">
            <Gem size={32} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold tracking-tight text-white">
            Türkiye&apos;de Bir İlk: Doğal Akik Taşlı Kolonya
          </h3>
          <p className="text-sm text-stone-300 leading-relaxed font-light">
            Dr. Mars&apos;ın tescilli yeniliklerinden biri olan <strong>Hakiki Akik Taşı ve Pembe Kuvars Parçacıklı Kolonya Serisi</strong>; yeryüzünün milyonlarca yılda kristalleşen pozitif mineral dengesini, teninizde gün boyu süren kalıcı bir zarafetle birleştirir.
          </p>
          <div className="space-y-3.5 pt-2 text-xs text-stone-300">
            <div className="flex items-center gap-3">
              <Droplet size={18} className="text-[#c5a880] shrink-0" />
              <span>Tortu bırakmayan, şeffaf ve %100 saf esansiyel yağ dengesi</span>
            </div>
            <div className="flex items-center gap-3">
              <FlaskConical size={18} className="text-[#c5a880] shrink-0" />
              <span>Dermatolojik olarak test edilmiş, ten dostu ve ferahlatıcı etki</span>
            </div>
            <div className="flex items-center gap-3">
              <Compass size={18} className="text-[#c5a880] shrink-0" />
              <span>Mardin Kalesi, Deyrulzafaran ve Mezopotamya tematik koku piramitleri</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-[#dfcca8]">T.C. MARKA TESCİL NO: 2023/14892</span>
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Award size={16} className="text-[#c5a880]" /> Orijinal Patentli
            </span>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 bg-white border-y border-stone-200">
        <div className="p-10 sm:p-14">
          <span className="text-xs font-mono font-black text-[#8f7351] tracking-widest uppercase">
            01 / BİLİM VE DOĞALLIK
          </span>
          <h3 className="mt-6 text-2xl font-serif-luxury font-bold tracking-tight text-stone-900">
            Mühendislik Hassasiyeti
          </h3>
          <p className="mt-4 text-sm text-stone-600 leading-relaxed">
            Tüm formüllerimiz, Kimya Mühendisi kurucumuzun gözetiminde IFRA (International Fragrance Association) rehberliğinde geliştirilir. Ağır kimyasal içermeyen, baş ağrıtmayan, temiz ve dengeli notalar üretilir.
          </p>
        </div>

        <div className="p-10 sm:p-14">
          <span className="text-xs font-mono font-black text-[#8f7351] tracking-widest uppercase">
            02 / KÜLTÜREL KOKU MİRASI
          </span>
          <h3 className="mt-6 text-2xl font-serif-luxury font-bold tracking-tight text-stone-900">
            Yöresel & İkonik Notalar
          </h3>
          <p className="mt-4 text-sm text-stone-600 leading-relaxed">
            Zeytin çiçeği, tütün, incir, badem, safran ve Akdeniz bergamotu; Mardin&apos;in bin yıllık misafirperverlik ritüelini modern sofralara ve evlere taşır.
          </p>
        </div>

        <div className="p-10 sm:p-14">
          <span className="text-xs font-mono font-black text-[#8f7351] tracking-widest uppercase">
            03 / PREMİUM AMBALAJ & SUNUM
          </span>
          <h3 className="mt-6 text-2xl font-serif-luxury font-bold tracking-tight text-stone-900">
            Lüks Hediye Deneyimi
          </h3>
          <p className="mt-4 text-sm text-stone-600 leading-relaxed">
            Özel tasarım cam şişeler, altın detaylı püskürtücüler ve darbeye dayanıklı lüks kutular sayesinde her Dr. Mars ürünü unutulmaz bir hediye niteliği taşır.
          </p>
        </div>
      </section>

      {/* Production & Showroom Locations */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-12">
        <div className="text-center mb-14">
          <span className="text-xs font-mono font-black text-[#8f7351] tracking-widest uppercase">
            LOKASYONLARIMIZ & ÜRETİM
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
            Mardin&apos;deki Adreslerimiz
          </h2>
          <p className="mt-3 text-sm text-stone-600 max-w-lg mx-auto">
            Koku sanatımızı yakından deneyimlemek için tarihi butik showroomumuza veya üretim merkezimize bekleriz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-stone-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf8f5] border border-[#e7e3d8] text-[#8f7351]">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Tarihi Butik Showroom</h3>
                <p className="text-xs text-stone-500">Mardin Tarihi 1. Cadde Mağazası</p>
              </div>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Şar Mahallesi, 1. Cadde No: 284, 47100 Artuklu / Mardin
            </p>
            <p className="text-xs text-stone-500">
              Mardin&apos;in bin yıllık taş kemerleri altında tüm niş parfümlerimizi, akik taşlı kolonyalarımızı ve esanslarımızı deneyimleyin.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-stone-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf8f5] border border-[#e7e3d8] text-[#8f7351]">
                <FlaskConical size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Üretim Tesisi & Ar-Ge Laboratuvarı</h3>
                <p className="text-xs text-stone-500">Mardin Organize Sanayi Bölgesi</p>
              </div>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Mardin OSB 2. Cadde No: 14, Artuklu / Mardin
            </p>
            <p className="text-xs text-stone-500">
              İleri teknoloji tam otomatik dolum hatları, saflaştırma kolonları, mikrobiyoloji ve formülasyon laboratuvarımız.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="flex flex-col gap-8 bg-[#0c1117] border-t border-[#1b232e] px-6 py-16 text-white md:flex-row md:items-center md:justify-between md:px-[10vw]">
        <div className="space-y-2">
          <h2 className="text-2xl font-serif-luxury font-bold text-white">
            Doğrudan Üreticiden, Mardin OSB Güvencesiyle
          </h2>
          <p className="text-sm text-stone-300 max-w-xl">
            Tüm ürünlerimiz aynı gün özel darbe korumalı kutularında kargoya verilir. 1.500 TL üzeri siparişlerde kargo ücretsizdir.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 self-start md:self-center rounded-xl bg-[#c5a880] px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#0a0e14] hover:bg-[#dfcca8] transition-all shadow-xl hover:scale-105 active:scale-95 shrink-0"
        >
          Ürünleri Hemen İncele <ArrowRight size={16} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
