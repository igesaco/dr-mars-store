import type { Metadata } from "next";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İptal ve İade Koşulları | Dr. Mars",
  description: "Dr. Mars sipariş iptali, kargo hasarı ve iade prosedürleri.",
};

export default async function ReturnPolicyPage() {
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
          <p className="eyebrow dark">MÜŞTERİ HİZMETLERİ</p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-stone-900">
            İptal ve İade Koşulları
          </h1>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h2 className="text-base font-bold text-stone-900">Sipariş İptali</h2>
            <p>
              Siparişiniz henüz kargoya verilmediyse (durumu &quot;Bekliyor&quot; veya &quot;Hazırlanıyor&quot; iken) 0 (482) 212 19 03 numaralı müşteri destek hattımızı arayarak veya info@drmarsparfum.com adresine e-posta göndererek siparişinizi ücretsiz olarak iptal edebilirsiniz. İptal edilen siparişlerin ücret iadesi bankanıza bağlı olarak 1-3 iş günü içinde kartınıza yansıtılır.
            </p>

            <h2 className="text-base font-bold text-stone-900 pt-2">İade Şartları ve Süreci</h2>
            <p>
              Teslim aldığınız ürünleri, kargo teslim tarihinden itibaren 14 gün içerisinde iade edebilirsiniz.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>İade edilecek ürünün koruyucu kapağı, güvenlik emniyet bandı açılmamış olmalıdır.</li>
              <li>Ürün orijinal ambalajı ve kutusuyla birlikte eksiksiz olarak gönderilmelidir.</li>
              <li>Hasarlı veya ayıplı ürünler için kargo görevlisine tutanak tutturulması süreci hızlandıracaktır.</li>
            </ul>

            <h2 className="text-base font-bold text-stone-900 pt-2">Kargo Hasarı Durumunda Ne Yapılmalıdır?</h2>
            <p>
              Kargonuzu teslim alırken paket üzerinde ezilme, yırtılma veya ıslaklık fark ederseniz lütfen kurye eşliğinde paketi açarak hasar tespit tutanağı hazırlatınız ve paketi teslim almayınız. Destek ekibimiz derhal yeni ürün gönderimi sağlayacaktır.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
