"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  ExternalLink,
  Factory,
  FlaskConical,
  Gem,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    setSubscribed(true);
    setEmail("");
    toast.success("Dr. Mars Parfümeri bültenine başarıyla kaydoldunuz!");
  };

  return (
    <footer className="w-full block bg-[#0b141d] text-stone-300 border-t border-stone-800 clear-both">
      {/* Top Corporate Assurance Bar */}
      <div className="w-full block border-b border-stone-800/80 bg-[#0e1924] py-8 px-6 sm:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#152332] text-[#caff73]">
              <FlaskConical size={20} />
            </div>
            <div>
              <strong className="block font-black text-white text-[13px]">
                Mühendislik & Bilim
              </strong>
              <span className="text-stone-400 text-[11px]">
                Kimya Müh. Hamdullah Adsoy Formülleri
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#152332] text-[#caff73]">
              <Gem size={20} />
            </div>
            <div>
              <strong className="block font-black text-white text-[13px]">
                Doğal Taş İnovasyonu
              </strong>
              <span className="text-stone-400 text-[11px]">
                Hakiki Akik & Kuvars Kristalli
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#152332] text-[#caff73]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong className="block font-black text-white text-[13px]">
                GMP & ISO 9001
              </strong>
              <span className="text-stone-400 text-[11px]">
                Sağlık Bakanlığı ÜTS Kayıtlı Üretim
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#152332] text-[#caff73]">
              <Truck size={20} />
            </div>
            <div>
              <strong className="block font-black text-white text-[13px]">
                Hızlı & Sigortalı Kargo
              </strong>
              <span className="text-stone-400 text-[11px]">
                1500 TL Üzeri Ücretsiz Teslimat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Newsletter & Brand Heritage Banner */}
      <div className="w-full block border-b border-stone-800/80 py-12 sm:py-14 px-6 sm:px-12">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#caff73]">
              KADİM MEZOPOTAMYA KOKU MİRASI
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dr. Mars Koku Kulübü&apos;ne Katılın
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed">
              Mardin Organize Sanayi Bölgesi laboratuvarlarımızda üretilen en yeni niş parfümler, doğal akik taşlı kolonyalar ve sınırlı üretim hediye setlerinden ilk siz haberdar olun.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center justify-center lg:justify-end gap-2 text-xs font-bold text-[#caff73] bg-white/5 py-3 px-6 rounded-xl border border-[#caff73]/30">
                <CheckCircle2 size={18} /> Bültenimize başarıyla katıldınız!
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full sm:w-[420px] rounded-xl border border-stone-700 bg-[#121e2b] p-1.5 focus-within:border-[#caff73] transition-colors"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresinizi yazın..."
                  className="w-full bg-transparent px-3.5 py-2 text-xs text-white placeholder:text-stone-500 outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 shrink-0 rounded-lg bg-[#caff73] px-5 py-2 text-xs font-black uppercase tracking-wider text-stone-950 hover:bg-white transition-colors cursor-pointer"
                >
                  Katıl <ArrowUpRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Corporate Links Navigation (5 Columns) */}
      <div className="w-full block py-14 sm:py-16 px-6 sm:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs">
        {/* Col 1: Brand & Official Registration */}
        <div className="space-y-4 lg:col-span-1">
          <Link className="brand text-white text-2xl font-black tracking-tighter" href="/">
            <span>DR</span>
            <i className="inline-block w-2.5 h-2.5 bg-[#caff73] rounded-full mx-1" />
            <span>MARS</span>
          </Link>
          <p className="text-[11px] text-[#caff73] font-black uppercase tracking-wider">
            PARFÜMERİ & MODERN KOLONYA
          </p>
          <p className="text-stone-400 leading-relaxed text-xs">
            Mardinli Kimya Mühendisi Hamdullah Adsoy tarafından kurulan Dr. Mars; Mezopotamya&apos;nın binlerce yıllık koku mirasını ve akik taşı enerjisini çağdaş parfümeriyle harmanlar.
          </p>

          <div className="pt-2 text-[11px] text-stone-400 space-y-1 font-mono border-t border-stone-800/80 pt-3">
            <p className="text-stone-300 font-bold">Dr. Mars Kozmetik Kimya San. ve Tic. Ltd. Şti.</p>
            <p>Mardin V.D. · VKN: 2340981249</p>
            <p>Mersis: 0234098124900001</p>
          </div>
        </div>

        {/* Col 2: Kurumsal */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#caff73]" /> Kurumsal
          </h3>
          <ul className="space-y-2.5 text-stone-400">
            <li>
              <Link href="/hakkimizda" className="hover:text-white transition-colors">
                Hakkımızda & Hikayemiz
              </Link>
            </li>
            <li>
              <Link href="/hakkimizda" className="hover:text-white transition-colors">
                Kurucumuz Hamdullah Adsoy
              </Link>
            </li>
            <li>
              <Link href="/hakkimizda" className="hover:text-white transition-colors">
                Mardin OSB Üretim Tesisi
              </Link>
            </li>
            <li>
              <Link href="/hakkimizda" className="hover:text-white transition-colors">
                Doğal Akik Taşı İnovasyonu
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className="hover:text-white transition-colors">
                Bayilik & Toptan Satış
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className="hover:text-white transition-colors">
                İletişim & Lokasyonlar
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Koleksiyonlar */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-1.5">
            <Gem size={13} className="text-[#caff73]" /> Koleksiyonlar
          </h3>
          <ul className="space-y-2.5 text-stone-400">
            <li>
              <Link href="/kategori/kolonyalar" className="hover:text-white transition-colors">
                Tüm Kolonyalar
              </Link>
            </li>
            <li>
              <Link href="/urun/citrus-no-01" className="hover:text-white transition-colors">
                Citrus No. 01 (Akik Taşlı)
              </Link>
            </li>
            <li>
              <Link href="/urun/mineral-no-02" className="hover:text-white transition-colors">
                Mineral No. 02 (Pembe Kuvars)
              </Link>
            </li>
            <li>
              <Link href="/urun/night-no-03" className="hover:text-white transition-colors">
                Night No. 03 (Mistik Sedir)
              </Link>
            </li>
            <li>
              <Link href="/urun/amber-no-04" className="hover:text-white transition-colors">
                Amber No. 04 (Sıcak Baharat)
              </Link>
            </li>
            <li>
              <Link href="/kategori/hediye-setleri" className="hover:text-white transition-colors">
                Özel Hediye Setleri
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Müşteri & Yasal Haklar */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#caff73]" /> Yasal & Müşteri
          </h3>
          <ul className="space-y-2.5 text-stone-400">
            <li>
              <Link href="/siparis-takip" className="hover:text-white transition-colors font-bold text-stone-300">
                Sipariş & Kargo Takibi
              </Link>
            </li>
            <li>
              <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white transition-colors">
                Mesafeli Satış Sözleşmesi
              </Link>
            </li>
            <li>
              <Link href="/iade-ve-iptal" className="hover:text-white transition-colors">
                İptal ve İade Prosedürü
              </Link>
            </li>
            <li>
              <Link href="/gizlilik-ve-cerez-politikasi" className="hover:text-white transition-colors">
                Gizlilik & Çerez Politikası
              </Link>
            </li>
            <li>
              <Link href="/kvkk" className="hover:text-white transition-colors">
                KVKK Aydınlatma Metni
              </Link>
            </li>
            <li>
              <Link href="/hesabim" className="hover:text-white transition-colors">
                Müşteri Hesabı & Geçmiş
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Lokasyonlar & Resmi İletişim */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-1.5">
            <MapPin size={13} className="text-[#caff73]" /> Lokasyon & İletişim
          </h3>

          <div className="space-y-2 text-stone-400">
            <div>
              <strong className="block text-stone-200 text-[11px] font-bold">
                Tarihi Butik Showroom:
              </strong>
              <p className="text-[11px] leading-relaxed">
                Şar Mah. 1. Cadde No: 284 Artuklu / Mardin
              </p>
            </div>

            <div>
              <strong className="block text-stone-200 text-[11px] font-bold">
                Üretim Tesisi (Fabrika):
              </strong>
              <p className="text-[11px] leading-relaxed">
                Mardin OSB 2. Cadde No: 14 Artuklu / Mardin
              </p>
            </div>

            <div className="pt-1 space-y-1 text-stone-300 font-bold">
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-[#caff73]" /> +90 (482) 212 19 03
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle size={13} className="text-emerald-400" /> +90 (544) 212 19 03
              </p>
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-[#caff73]" /> info@drmarsparfum.com
              </p>
            </div>

            {/* Instagram Official Follow */}
            <div className="pt-2">
              <a
                href="https://www.instagram.com/dr.marsparfumeri/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white hover:border-white transition-all w-full justify-center"
              >
                <InstagramIcon size={15} className="text-rose-400" />
                <span>@dr.marsparfumeri</span>
                <ExternalLink size={12} className="opacity-60" />
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Compliance & Quality Certification Footnote */}
      <div className="w-full block border-t border-stone-800/80 py-6 px-6 sm:px-12 bg-[#091017]">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-[11px] text-stone-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold text-stone-300">
              <Award size={14} className="text-[#caff73]" /> GMP Sertifikalı Üretim
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-stone-300">
              <ShieldCheck size={14} className="text-[#caff73]" /> Sağlık Bakanlığı ÜTS Bildirimli
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-stone-300">
              <FlaskConical size={14} className="text-[#caff73]" /> IFRA Standartları
            </span>
            <span>·</span>
            <span>%100 Yerli Üretim (Mardin)</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-stone-500">
            <span>256-Bit SSL</span>
            <span>3D Secure</span>
            <span>Troy / Visa / MasterCard</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="w-full block border-t border-stone-900 py-6 px-6 sm:px-12 bg-[#060b10] text-xs text-stone-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Dr. Mars Kozmetik Kimya San. ve Tic. Ltd. Şti. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6 text-stone-400">
            <a
              href="https://www.instagram.com/dr.marsparfumeri/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#caff73] transition-colors flex items-center gap-1"
            >
              <InstagramIcon size={13} /> Instagram
            </a>
            <Link href="/iletisim" className="hover:text-white transition-colors">
              Müşteri Hizmetleri
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Yönetici Girişi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
