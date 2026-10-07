"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  ExternalLink,
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
import { BrandLogo } from "./brand-logo";
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
    toast.success("Dr. Mars Parfümeri VIP bültenine başarıyla kaydoldunuz!");
  };

  return (
    <footer className="w-full block bg-[#080c10] text-stone-300 border-t border-[#1b232e] clear-both">
      {/* Üst Kurumsal Güvence Bandı */}
      <div className="w-full block border-b border-[#1b232e] bg-[#0c1117] py-8 px-6 sm:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141b24] border border-[#c5a880]/20 text-[#c5a880]">
              <FlaskConical size={20} />
            </div>
            <div>
              <strong className="block font-bold text-white text-[13px] tracking-wide">
                Mühendislik & Bilim
              </strong>
              <span className="text-stone-400 text-[11px]">
                Kimya Müh. Hamdullah Adsoy Formülleri
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141b24] border border-[#c5a880]/20 text-[#c5a880]">
              <Gem size={20} />
            </div>
            <div>
              <strong className="block font-bold text-white text-[13px] tracking-wide">
                Doğal Taş İnovasyonu
              </strong>
              <span className="text-stone-400 text-[11px]">
                Hakiki Akik & Kuvars Kristalleri
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141b24] border border-[#c5a880]/20 text-[#c5a880]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong className="block font-bold text-white text-[13px] tracking-wide">
                GMP & ISO 9001
              </strong>
              <span className="text-stone-400 text-[11px]">
                Sağlık Bakanlığı ÜTS Kayıtlı Üretim
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141b24] border border-[#c5a880]/20 text-[#c5a880]">
              <Truck size={20} />
            </div>
            <div>
              <strong className="block font-bold text-white text-[13px] tracking-wide">
                Hızlı & Sigortalı Teslimat
              </strong>
              <span className="text-stone-400 text-[11px]">
                1.500 TL Üzeri Ücretsiz Kargo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Bülten & Mezopotamya Mirası */}
      <div className="w-full block border-b border-[#1b232e] py-12 sm:py-14 px-6 sm:px-12 bg-gradient-to-b from-[#0c1117] to-[#080c10]">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c5a880]">
              KADİM MEZOPOTAMYA KOKU MİRASI
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-serif-luxury text-white tracking-tight">
              Dr. Mars Ayrıcalıklı Dünyasına Katılın
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed">
              Mardin Organize Sanayi Bölgesi tesislerimizde üretilen sınırlı seri niş kolonyalar, patentli doğal taş inovasyonları ve özel davetlerden ilk siz haberdar olun.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center justify-center lg:justify-end gap-2 text-xs font-bold text-[#dfcca8] bg-[#c5a880]/10 py-3.5 px-6 rounded-xl border border-[#c5a880]/30">
                <CheckCircle2 size={18} /> Bültenimize başarıyla dahil oldunuz.
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full sm:w-[420px] rounded-xl border border-[#263140] bg-[#111722] p-1.5 focus-within:border-[#c5a880] transition-colors"
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
                  className="flex items-center gap-1.5 shrink-0 rounded-lg bg-[#c5a880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0b0f15] hover:bg-[#dfcca8] transition-colors cursor-pointer"
                >
                  Katıl <ArrowUpRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 5 Kolonlu Kurumsal Navigasyon */}
      <div className="w-full block py-14 sm:py-16 px-6 sm:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs">
          {/* Kolon 1: Marka & Resmi Tescil */}
          <div className="space-y-4 lg:col-span-1">
            <BrandLogo variant="dark" size="md" href="/" />

            <p className="text-stone-400 leading-relaxed text-xs">
              Mardinli Kimya Mühendisi Hamdullah Adsoy tarafından kurulan Dr. Mars; Mezopotamya&apos;nın binlerce yıllık koku mirasını ve akik taşı enerjisini çağdaş parfümeriyle harmanlar.
            </p>

            <div className="text-[11px] text-stone-400 space-y-1 font-mono border-t border-[#1b232e] pt-3">
              <p className="text-stone-300 font-bold">Dr. Mars Kozmetik Kimya San. ve Tic. Ltd. Şti.</p>
              <p>Mardin V.D. · VKN: 2340981249</p>
              <p>Mersis: 0234098124900001</p>
            </div>
          </div>

          {/* Kolon 2: Kurumsal */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#c5a880]" /> Kurumsal
            </h3>
            <ul className="space-y-2.5 text-stone-400">
              <li>
                <Link href="/hakkimizda" className="hover:text-white transition-colors">
                  Hakkımızda & Kurumsal
                </Link>
              </li>
              <li>
                <Link href="/hikayemiz" className="hover:text-white transition-colors text-[#dfcca8]">
                  Hikayemiz & Koku Felsefemiz
                </Link>
              </li>
              <li>
                <Link href="/hikayemiz#akik-felsefesi" className="hover:text-white transition-colors">
                  Doğal Akik Taşı Felsefesi
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda#laboratuvar" className="hover:text-white transition-colors">
                  Mardin OSB Laboratuvarı
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

          {/* Kolon 3: Koleksiyonlar */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-1.5">
              <Gem size={13} className="text-[#c5a880]" /> Koleksiyonlar
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

          {/* Kolon 4: Müşteri & Yasal Haklar */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#c5a880]" /> Yasal & Müşteri
            </h3>
            <ul className="space-y-2.5 text-stone-400">
              <li>
                <Link href="/siparis-takip" className="hover:text-white transition-colors font-bold text-[#dfcca8]">
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

          {/* Kolon 5: Lokasyonlar & Resmi İletişim */}
          <div className="space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#c5a880]" /> Lokasyon & İletişim
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
                  <Phone size={13} className="text-[#c5a880]" /> +90 (482) 212 19 03
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle size={13} className="text-emerald-400" /> +90 (544) 212 19 03
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={13} className="text-[#c5a880]" /> info@drmarsparfum.com
                </p>
              </div>

              {/* Instagram Resmi Takip Kartı */}
              <div className="pt-2">
                <a
                  href="https://www.instagram.com/dr.marsparfumeri/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#141b24] border border-[#c5a880]/30 px-3.5 py-2 text-xs font-bold text-white hover:border-[#c5a880] transition-all w-full justify-center"
                >
                  <InstagramIcon size={14} className="text-[#dfcca8]" />
                  <span>@dr.marsparfumeri</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uyumluluk & Kalite Sertifikaları */}
      <div className="w-full block border-t border-[#1b232e] py-6 px-6 sm:px-12 bg-[#06090d]">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-[11px] text-stone-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold text-stone-300">
              <Award size={14} className="text-[#c5a880]" /> GMP Sertifikalı Üretim
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-stone-300">
              <ShieldCheck size={14} className="text-[#c5a880]" /> T.C. Sağlık Bakanlığı ÜTS Bildirimli
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-stone-300">
              <FlaskConical size={14} className="text-[#c5a880]" /> IFRA Standartlarında Esanslar
            </span>
            <span>·</span>
            <span>%100 Yerli Üretim (Mardin OSB)</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-stone-500">
            <span>256-Bit SSL</span>
            <span>3D Secure</span>
            <span>Troy / Visa / MasterCard</span>
          </div>
        </div>
      </div>

      {/* Alt Telif Hakkı Barı */}
      <div className="w-full block border-t border-[#141920] py-6 px-6 sm:px-12 bg-[#040608] text-xs text-stone-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Dr. Mars Kozmetik Kimya San. ve Tic. Ltd. Şti. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6 text-stone-400">
            <a
              href="https://www.instagram.com/dr.marsparfumeri/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#dfcca8] transition-colors flex items-center gap-1"
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
