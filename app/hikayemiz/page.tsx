import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Compass,
  Crown,
  Droplet,
  Feather,
  FlaskConical,
  Gem,
  History,
  MapPin,
  Scroll,
  Sparkles,
  SunMedium,
  Wind,
} from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { IntroCinematic } from "@/components/storefront/intro-cinematic";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hikayemiz & Koku Felsefemiz | Dr. Mars Haute Parfumerie Mardin",
  description:
    "4.000 yıllık kadim Mezopotamya koku simyası, kurucumuz Kimya Mühendisi Hamdullah Adsoy'un vizyonu ve her flakonda yaşayan hakiki doğal akik taşının derin felsefesi.",
};

export default async function StoryPage() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement =
    (typeof settings.announcement === "object" &&
    settings.announcement !== null &&
    "text" in settings.announcement
      ? String(settings.announcement.text)
      : null) ??
    "MARDİN OSB LABORATUVARLARINDAN · 1.500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#0b1724]">
      <IntroCinematic />
      <Header categories={navCategories} announcementText={announcement} />

      {/* 1. HERO BÖLÜMÜ: TAŞIN VE KOKUNUN SİMYASI */}
      <section className="relative overflow-hidden bg-[#070b10] text-white py-24 sm:py-32 px-6 sm:px-12 border-b border-[#c5a880]/20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 rounded-full bg-[#c5a880]/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-4xl text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18212d] border border-[#c5a880]/30 text-[#dfcca8] text-[11px] font-bold tracking-[0.25em] uppercase">
            <Sparkles size={14} className="text-[#c5a880]" />
            <span>Koku Sanatının Kadim Kökenleri</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
            Taşın ve Kokunun <br />
            <span className="italic font-light text-[#dfcca8]">Mezopotamya Simyası</span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
            Mardin&apos;in binlerce yıllık kadim taş sokaklarında, rüzgarın taşıdığı yabani
            botaniklerin fısıltısı duyulur. Dr. Mars; geçmişin unutulmuş koku hafızasını,
            hakiki doğal akik taşının frekansıyla ve modern kimya mühendisliğiyle buluşturarak
            yeniden yazıyor.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <Link
              href="#akik-felsefesi"
              className="px-6 py-3 rounded-full bg-[#c5a880] text-[#070b10] font-bold hover:bg-[#dfcca8] transition-colors shadow-lg"
            >
              Akik Taşı Felsefesini Keşfet ↓
            </Link>
            <Link
              href="/kategori/kolonyalar"
              className="px-6 py-3 rounded-full border border-stone-600 hover:border-white text-white transition-colors"
            >
              Koleksiyonu İncele →
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KADİM MİRAS: BABİL'DEN MARDİN'E KOKU YOLCULUĞU */}
      <section className="py-20 sm:py-28 px-6 sm:px-12 border-b border-[#e7e3d8]">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#91754f] text-[11px] font-bold tracking-[0.25em] uppercase">
              <Scroll size={16} />
              <span>4.000 Yıllık Koku Mirası</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 leading-snug">
              Tarihin İlk Parfümörlerinin <br />
              <span className="italic text-[#91754f]">Kadim Toprakları</span>
            </h2>
            <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
              <p>
                Tarihçiler, dünyanın kaydedilmiş ilk kimyageri ve koku ustasının M.Ö. 1200&apos;lerde
                Mezopotamya tabletlerinde adı geçen <strong>Tapputi</strong> olduğunu söyler. Tapputi;
                çiçekleri, mürrü, calamus&apos;u ve sedir ağacını damıtarak krallara layık kokular yaratırdı.
              </p>
              <p>
                Mardin, İpek Yolu ve Baharat Yolu&apos;nun kesiştiği o büyük kavşakta; taş binalarının serin
                kemerleri altında asırlardır bu koku mirasını sakladı. Güneşin ısıttığı sarı kalker
                taşları, akşam serinliğinde reyhan, bergamot, kehribar ve lavanta kokularını nefes gibi
                dışarı bırakırdı.
              </p>
              <p>
                Dr. Mars olarak amacımız, sıradan bir koku üretmek değil; bu topraklara ait kadim
                belleği asil ve modern bir lüks anlayışıyla şişelemektir.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e7e3d8]">
              <div>
                <strong className="block text-2xl font-serif text-[#0b1724]">M.Ö. 1200</strong>
                <span className="text-[11px] text-stone-500 font-medium">İlk Koku Tabletleri</span>
              </div>
              <div>
                <strong className="block text-2xl font-serif text-[#0b1724]">İpek Yolu</strong>
                <span className="text-[11px] text-stone-500 font-medium">Baharat Kavşağı</span>
              </div>
              <div>
                <strong className="block text-2xl font-serif text-[#0b1724]">%80 Etil</strong>
                <span className="text-[11px] text-stone-500 font-medium">Saf Distilasyon</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border border-[#e7e3d8] bg-[#0c1219] p-8 flex flex-col justify-between text-white relative group">
              <div className="space-y-4">
                <span className="inline-block text-[#c5a880] text-xs font-bold tracking-[0.2em] uppercase">
                  Kadim Taşın Fısıltısı
                </span>
                <blockquote className="text-lg sm:text-xl font-serif italic text-stone-200 leading-relaxed">
                  &ldquo;Koku yalnızca havada uçuşan moleküller değildir. Koku, zamanın taş üzerinde bıraktığı
                  en sadık izdir.&rdquo;
                </blockquote>
              </div>
              <div className="pt-8 border-t border-white/15 flex items-center justify-between">
                <div>
                  <strong className="block text-sm font-semibold text-white">Mardin Artuklu Atölyesi</strong>
                  <span className="text-xs text-stone-400">Haute Parfumerie Ruhu</span>
                </div>
                <Compass size={28} className="text-[#c5a880]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KURUCUMUZUN SERÜVENİ: HAMDULLAH ADSOY */}
      <section className="py-20 sm:py-28 px-6 sm:px-12 bg-white border-b border-[#e7e3d8]">
        <div className="mx-auto max-w-5xl text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 text-[#91754f] text-[11px] font-bold tracking-[0.25em] uppercase">
            <FlaskConical size={16} />
            <span>Kurucumuzun Hikayesi</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-950">
            Kimya Mühendisliğinin Bilimi, <br />
            <span className="italic text-[#91754f]">Koku Sanatının Tutkusu</span>
          </h2>
          <p className="text-stone-600 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Dr. Mars&apos;ın temelleri, kurucumuz Kimya Mühendisi Hamdullah Adsoy&apos;un laboratuvar masasında
            ve çocukluğunun geçtiği Mezopotamya bahçelerinde atıldı.
          </p>
        </div>

        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="p-8 rounded-3xl bg-[#faf8f5] border border-[#e7e3d8] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-[#91754f] uppercase">
                Başlangıç Noktası
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Geleneksel Kolonyanın Ötesine Geçmek
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Yıllarca klasik kolonyaların birbirini tekrar eden, sentetik limon ve geçici koku
                dünyasından rahatsız olan Hamdullah Adsoy; yüksek oranda saf esans, doğal yağlar ve
                kalıcı parfümeri piramidine sahip niş kolonyalar formüle etmeye karar verdi.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-200 text-stone-700 text-xs italic">
              &ldquo;Bir parfüm yalnızca teninize değil, o anki enerjinize dokunmalıdır.&rdquo;
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#0c1219] text-white space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-[#c5a880] uppercase">
                Laboratuvardan Dünyaya
              </span>
              <h3 className="text-xl font-serif font-bold text-white">
                Mardin OSB&apos;de Yüksek Standart
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                Mardin Organize Sanayi Bölgesi&apos;nde kurulan modern laboratuvarlarda, GMP ve ISO standartlarına
                uygun olarak her formül aylarca olgunlaştırılır. Saf etil alkol ile esans yağları
                karanlık maserasyon tanklarında dinginliğe kavuşturulur.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-800 text-[#dfcca8] text-xs font-bold tracking-wider uppercase">
              Hamdullah Adsoy · Kimya Mühendisi & Kurucu
            </div>
          </div>
        </div>
      </section>

      {/* 4. AKİK TAŞI FELSEFESİ (ŞİŞEDEKİ TAŞIN GİZEMİ) */}
      <section id="akik-felsefesi" className="py-20 sm:py-28 px-6 sm:px-12 bg-[#090d13] text-white border-b border-[#c5a880]/20 relative">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18212d] border border-[#c5a880]/30 text-[#dfcca8] text-[11px] font-bold tracking-[0.25em] uppercase">
              <Gem size={14} className="text-[#c5a880]" />
              <span>Neden Akik Taşı?</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
              Her Şişede Yaşayan <br />
              <span className="italic font-light text-[#dfcca8]">Doğal Akik Taşı</span>
            </h2>
            <p className="text-stone-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
              Dr. Mars flakonlarını elinize aldığınızda şişenin dibinde parıldayan hakiki akik taşını
              görürsünüz. Bu bir süs değil; hem metafizik hem de moleküler bir felsefedir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#111822] border border-[#c5a880]/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#c5a880]">
                <SunMedium size={20} />
              </div>
              <h3 className="text-base font-serif font-bold text-white">Frekans ve Denge</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Doğal akik taşı, asırlardır negatif enerjiyi nötralize eden, bedensel ve zihinsel dengeyi
                sağlayan kutsal bir mineral olarak kabul edilir. Şişedeki her dokunuş enerjiyi tazeler.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111822] border border-[#c5a880]/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#c5a880]">
                <Droplet size={20} />
              </div>
              <h3 className="text-base font-serif font-bold text-white">Moleküler Dinlendirme</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Kuvars grubu mineral kristallerin mikro titreşimleri, esans yağlarının şişe içindeki
                maserasyon dengesini korur ve kokunun açılış notalarını daha kadife ve pürüzsüz kılar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111822] border border-[#c5a880]/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#c5a880]">
                <Crown size={20} />
              </div>
              <h3 className="text-base font-serif font-bold text-white">Ömür Boyu Hatıra</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Parfümünüz bittiğinde geriye kalan akik taşı, üzerinizde taşıyabileceğiniz veya masanızda
                saklayabileceğiniz eşsiz bir doğal Mardin taşı hatırasıdır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ZAMAN ÇİZELGESİ (MILESTONES) */}
      <section className="py-20 sm:py-28 px-6 sm:px-12 bg-white border-b border-[#e7e3d8]">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[#91754f] text-[11px] font-bold tracking-[0.25em] uppercase">
              Gelişim Çizelgemiz
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-950">
              Fikirden Küresel Lüks Markaya
            </h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-[#e7e3d8]">
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="md:w-1/2 md:text-right md:pr-10 pl-10 md:pl-0 space-y-1">
                <span className="text-xs font-bold text-[#91754f]">2018 · Mardin</span>
                <h3 className="text-base font-serif font-bold text-stone-900">Tarihi Formüllerin İzinde</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Mezopotamya antik koku yazıtlarının taranması ve Kimya Müh. Hamdullah Adsoy&apos;un laboratuvar
                  denemelerinin başlaması.
                </p>
              </div>
              <div className="absolute left-2.5 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#c5a880] border-4 border-white shadow-sm" />
              <div className="hidden md:block md:w-1/2" />
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="hidden md:block md:w-1/2" />
              <div className="absolute left-2.5 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0b1724] border-4 border-white shadow-sm" />
              <div className="md:w-1/2 md:pl-10 pl-10 space-y-1">
                <span className="text-xs font-bold text-[#91754f]">2020 · Akik Patenti</span>
                <h3 className="text-base font-serif font-bold text-stone-900">Taş ile Sıvının Buluşması</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Şişe içine yerleştirilen hakiki doğal akik taşının esans stabilitesi üzerindeki etkisi tescillendi
                  ve ilk prototip üretildi.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="md:w-1/2 md:text-right md:pr-10 pl-10 md:pl-0 space-y-1">
                <span className="text-xs font-bold text-[#91754f]">2022 · Üretim Kampüsü</span>
                <h3 className="text-base font-serif font-bold text-stone-900">Mardin OSB Modern Tesisi</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Organize Sanayi Bölgesi&apos;nde tam otomasyonlu, steril dolum ve GMP kalite standartlarına sahip
                  yüksek teknoloji fabrikamız faaliyete geçti.
                </p>
              </div>
              <div className="absolute left-2.5 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#c5a880] border-4 border-white shadow-sm" />
              <div className="hidden md:block md:w-1/2" />
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="hidden md:block md:w-1/2" />
              <div className="absolute left-2.5 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0b1724] border-4 border-white shadow-sm" />
              <div className="md:w-1/2 md:pl-10 pl-10 space-y-1">
                <span className="text-xs font-bold text-[#91754f]">Günümüz · Haute Parfumerie</span>
                <h3 className="text-base font-serif font-bold text-stone-900">Türkiye&apos;den Dünyaya Açılan Kapı</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Dört ikonik imza koku (Citrus, Mineral, Night, Amber) ile lüks niş kolonya ve parfüm severlerin
                  vazgeçilmezi olduk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ÇAĞRI (CTA): KOLEKSİYONU KEŞFET */}
      <section className="py-20 px-6 sm:px-12 bg-[#0c1219] text-white text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <span className="text-[#c5a880] text-xs font-bold tracking-[0.25em] uppercase">
            Bu Kadim Hikayenin Bir Parçası Olun
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Doğal Akik Taşlı Koleksiyonumuzu Deneyimleyin
          </h2>
          <p className="text-stone-300 text-sm font-light leading-relaxed">
            Mezopotamya rüzgarları, saf botanik yağlar ve doğal taşın frekansıyla bezenmiş özel serimizi
            hemen keşfedin.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/kategori/kolonyalar"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c5a880] text-[#070b10] font-bold text-xs uppercase tracking-wider hover:bg-[#dfcca8] transition-colors shadow-lg"
            >
              <span>Koleksiyonu Keşfet</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/hakkimizda"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-stone-600 hover:border-white text-white text-xs uppercase tracking-wider transition-colors"
            >
              <span>Kurumsal & Fabrika Detayları →</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
