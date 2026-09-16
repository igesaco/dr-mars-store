import type { Metadata } from "next";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Dr. Mars",
  description: "Dr. Mars mesafeli satış sözleşmesi ve ön bilgilendirme koşulları.",
};

export default async function DistanceContractPage() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-12">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p className="eyebrow dark">YASAL BİLGİLENDİRME</p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-stone-900">
            Mesafeli Satış Sözleşmesi
          </h1>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h2 className="text-base font-bold text-stone-900">MADDE 1 - TARAFLAR</h2>
            <p>
              <strong>SATICI:</strong><br />
              Unvanı: Dr. Mars Kozmetik Kimya Sanayi ve Ticaret Ltd. Şti.<br />
              Merkez Adresi: Şar Mah. 1. Cadde No: 284 Artuklu / Mardin<br />
              Üretim Tesisi: Mardin OSB 2. Cadde No: 14 Artuklu / Mardin<br />
              Vergi Dairesi: Mardin V.D. | VKN: 2340981249 | Mersis No: 0234098124900001<br />
              E-posta: info@drmarsparfum.com | Telefon: +90 (482) 212 19 03 | WhatsApp: +90 (544) 212 19 03
            </p>
            <p>
              <strong>ALICI (TÜKETİCİ):</strong><br />
              Dr. Mars internet sitesi üzerinden sipariş veren, adı-soyadı, teslimat adresi ve iletişim bilgileri sipariş formunda belirtilen gerçek veya tüzel kişidir.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">MADDE 2 - SÖZLEŞMENİN KONUSU</h2>
            <p>
              İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait www.drmars.com internet sitesinden elektronik ortamda siparişini yaptığı, sözleşmede bahsi geçen nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">MADDE 3 - TESLİMAT VE KARGO</h2>
            <p>
              Sipariş edilen ürünler, ALICI&apos;nın sipariş formunda belirttiği teslimat adresine anlaşmalı kargo firması (Yurtiçi Kargo) aracılığıyla en geç 30 günlük yasal süreyi aşmamak kaydıyla teslim edilir. 1500 TL ve üzeri siparişlerde kargo ücreti SATICI tarafından karşılanır.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">MADDE 4 - CAYMA HAKKI VE İSTİSNALARI</h2>
            <p>
              ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
            </p>
            <p>
              <strong>İstisna:</strong> 6502 sayılı Kanun ve ilgili yönetmelik uyarınca, ambalajı, güvenlik bandı veya koruyucu mührü açılmış olan kozmetik ve hijyenik ürünlerde (kolonya, parfüm vb.) sağlık ve hijyen açısından uygun olmaması sebebiyle cayma hakkı kullanılamaz.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
