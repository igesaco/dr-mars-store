import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { saveSiteSettingsAction, togglePaymentModeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const db = getDb();
  const rows = await db.select().from(siteSettings);
  const map: Record<string, any> = {};
  for (const r of rows) map[r.key] = r.value;

  const announcement = map.announcement ?? { text: "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ", active: true };
  const shipping = map.shipping ?? { freeThreshold: 1500, standardCost: 59, cargoCompany: "Yurtiçi Kargo" };
  const contact = map.contact ?? {
    phone: "+90 (482) 212 19 03",
    email: "info@drmarsparfum.com",
    address: "Şar Mah. 1. Cadde No: 284 Artuklu / Mardin",
    workingHours: "Haftanın 7 Günü: 09:00 - 20:00",
  };
  const social = map.social ?? {
    instagram: "https://www.instagram.com/dr.marsparfumeri/",
    facebook: "https://www.facebook.com/dr.marsparfumeri/",
  };

  const payment = map.payment ?? {
    mode: "test",
    provider: "simulation",
    paytrMerchantId: "",
    paytrMerchantKey: "",
    paytrMerchantSalt: "",
    iyzicoApiKey: "",
    iyzicoSecretKey: "",
    iyzicoBaseUrl: "https://sandbox-api.iyzipay.com",
    bankAccounts: [
      {
        bankName: "Akbank T.A.Ş.",
        accountHolder: "Dr. Mars Parfüm Kozmetik Ltd. Şti.",
        iban: "TR56 0004 6000 0001 2345 6789 01",
        branch: "Mardin Şubesi",
      },
    ],
  };

  const isLiveMode = payment.mode === "live";
  const bank1 = payment.bankAccounts?.[0] ?? {
    bankName: "Akbank T.A.Ş.",
    accountHolder: "Dr. Mars Parfüm Kozmetik Ltd. Şti.",
    iban: "TR56 0004 6000 0001 2345 6789 01",
    branch: "Mardin Şubesi",
  };
  const bank2 = payment.bankAccounts?.[1] ?? {
    bankName: "Ziraat Bankası",
    accountHolder: "Dr. Mars Parfüm Kozmetik Ltd. Şti.",
    iban: "TR12 0001 0001 2345 6789 0001 02",
    branch: "Artuklu Şubesi",
  };

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">MAĞAZA YAPILANDIRMASI</p>
          <h1>Site Ayarları</h1>
          <p className="admin-lead">Duyuru bandı, kargo kuralları, iletişim ve sosyal medya ayarlarını yönet.</p>
        </div>
      </header>

      {/* Ödeme Modu Hızlı Geçiş Bannerı */}
      <div
        className={`p-5 rounded-2xl border mb-8 max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs ${
          isLiveMode
            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
            : "bg-amber-50 border-amber-200 text-amber-950"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <span
            className={`flex h-4 w-4 rounded-full ${
              isLiveMode ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              SANAL POS ÖDEME DURUMU
            </p>
            <h3 className="text-base font-black tracking-tight text-stone-900">
              {isLiveMode
                ? "🟢 CANLI MOD AKTİF (Gerçek Kredi Kartı Çekimi Yapılır)"
                : "🧪 TEST MODU AKTİF (Simülasyon / Güvenli Test)"}
            </h3>
            <p className="text-xs text-stone-600 mt-0.5 max-w-xl">
              {isLiveMode
                ? "Müşterilerin siparişleri doğrudan tanımlı Sanal POS (PayTR/iyzico) üzerinden gerçek para tahsil edilerek işlenir."
                : "Müşteriler kart bilgilerini girerek sipariş verir ancak karttan gerçek para çekilmez; sistem siparişi ve stoğu güvenle test eder."}
            </p>
          </div>
        </div>

        <form action={togglePaymentModeAction} className="shrink-0">
          <button
            type="submit"
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer ${
              isLiveMode
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-700 hover:bg-emerald-800"
            }`}
          >
            {isLiveMode ? "🧪 Test Moduna Al" : "🟢 Canlı Moda Geç"}
          </button>
        </form>
      </div>

      <form action={saveSiteSettingsAction} className="space-y-8 max-w-4xl">
        {/* Duyuru Bandı */}
        <section className="admin-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            1. Üst Duyuru Bandı (Announcement Bar)
          </h2>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Duyuru Metni</label>
            <input
              name="announcementText"
              defaultValue={announcement.text}
              className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <input
              name="announcementActive"
              type="checkbox"
              defaultChecked={announcement.active}
              className="h-4 w-4 rounded"
            />
            Duyuru bandı sitede aktif görünsün
          </label>
        </section>

        {/* Kargo Kuralları */}
        <section className="admin-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            2. Kargo & Teslimat Kuralları
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ücretsiz Kargo Limiti (TL)
              </label>
              <input
                name="freeThreshold"
                type="number"
                defaultValue={shipping.freeThreshold}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Standart Kargo Ücreti (TL)
              </label>
              <input
                name="standardCost"
                type="number"
                defaultValue={shipping.standardCost}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Anlaşmalı Kargo Şirketi
              </label>
              <input
                name="cargoCompany"
                defaultValue={shipping.cargoCompany}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
          </div>
        </section>

        {/* İletişim Bilgileri */}
        <section className="admin-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            3. Mağaza İletişim Bilgileri
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Telefon Numarası</label>
              <input
                name="phone"
                defaultValue={contact.phone}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Destek E-posta Adresi</label>
              <input
                name="email"
                defaultValue={contact.email}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Mağaza / Şirket Adresi</label>
              <input
                name="address"
                defaultValue={contact.address}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Çalışma Saatleri</label>
              <input
                name="workingHours"
                defaultValue={contact.workingHours}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
          </div>
        </section>

        {/* Sosyal Medya */}
        <section className="admin-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            4. Sosyal Medya Hesapları
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Instagram Bağlantısı</label>
              <input
                name="instagram"
                defaultValue={social.instagram}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Facebook Bağlantısı</label>
              <input
                name="facebook"
                defaultValue={social.facebook}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
            </div>
          </div>
        </section>

        {/* 5. Ödeme & Sanal POS Yapılandırması */}
        <section className="admin-panel p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                5. Ödeme Yöntemleri & Sanal POS Entegrasyonu
              </h2>
              <p className="text-xs text-stone-500">
                Kredi kartı tahsilat modu, PayTR ve iyzico API parametrelerini yönet.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isLiveMode
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isLiveMode ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isLiveMode ? "Canlı Mod Aktif" : "Test Modu Aktif"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Çalışma Modu (Kredi Kartı)
              </label>
              <select
                name="paymentMode"
                defaultValue={payment.mode}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900 bg-white font-bold"
              >
                <option value="test">🧪 Test Modu (Simülasyon / Sandbox)</option>
                <option value="live">🟢 Canlı Mod (Gerçek Kart Çekimi)</option>
              </select>
              <p className="text-[11px] text-stone-500 mt-1">
                Test modunda müşterilerden gerçek para çekilmez, güvenli test siparişi oluşturulur.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Sanal POS Sağlayıcısı
              </label>
              <select
                name="paymentProvider"
                defaultValue={payment.provider}
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900 bg-white"
              >
                <option value="simulation">Özel Test Simülasyonu</option>
                <option value="paytr">PayTR (iFrame & Direkt API)</option>
                <option value="iyzico">iyzico (Checkout Form & API)</option>
              </select>
            </div>
          </div>

          {/* PayTR Bilgileri */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
              PayTR API Bilgileri (Canlı Mod İçin)
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Mağaza No (Merchant ID)</label>
                <input
                  name="paytrMerchantId"
                  defaultValue={payment.paytrMerchantId}
                  placeholder="Örn: 123456"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Mağaza Parolası (Merchant Key)</label>
                <input
                  name="paytrMerchantKey"
                  defaultValue={payment.paytrMerchantKey}
                  placeholder="paytr_key_..."
                  type="password"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Mağaza Gizli Anahtarı (Salt)</label>
                <input
                  name="paytrMerchantSalt"
                  defaultValue={payment.paytrMerchantSalt}
                  placeholder="paytr_salt_..."
                  type="password"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* iyzico Bilgileri */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
              iyzico API Bilgileri (Canlı Mod İçin)
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">API Key</label>
                <input
                  name="iyzicoApiKey"
                  defaultValue={payment.iyzicoApiKey}
                  placeholder="sandbox-... veya live-..."
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Secret Key</label>
                <input
                  name="iyzicoSecretKey"
                  defaultValue={payment.iyzicoSecretKey}
                  placeholder="secret_..."
                  type="password"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Base URL</label>
                <input
                  name="iyzicoBaseUrl"
                  defaultValue={payment.iyzicoBaseUrl}
                  placeholder="https://api.iyzipay.com"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Banka Hesapları (Havale / EFT) */}
        <section className="admin-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            6. Banka Hesapları (Havale / EFT İçin)
          </h2>
          <p className="text-xs text-stone-500">
            Müşterilerin ödeme sayfasında ve sipariş onay ekranında göreceği resmi banka ve IBAN bilgileri.
          </p>

          {/* Banka 1 */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <h3 className="text-xs font-black uppercase text-stone-800">1. Banka Hesabı (Öncelikli)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Banka Adı</label>
                <input
                  name="bank1Name"
                  defaultValue={bank1.bankName}
                  placeholder="Örn: Akbank T.A.Ş."
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Hesap Sahibi (Şirket Unvanı)</label>
                <input
                  name="bank1Holder"
                  defaultValue={bank1.accountHolder}
                  placeholder="Örn: Dr. Mars Parfüm Ltd. Şti."
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">IBAN Numarası</label>
                <input
                  name="bank1Iban"
                  defaultValue={bank1.iban}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono font-bold outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Şube Adı / Kodu</label>
                <input
                  name="bank1Branch"
                  defaultValue={bank1.branch}
                  placeholder="Örn: Artuklu Mardin Şubesi"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Banka 2 */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <h3 className="text-xs font-black uppercase text-stone-800">2. Banka Hesabı (Alternatif)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Banka Adı</label>
                <input
                  name="bank2Name"
                  defaultValue={bank2.bankName}
                  placeholder="Örn: Ziraat Bankası"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Hesap Sahibi</label>
                <input
                  name="bank2Holder"
                  defaultValue={bank2.accountHolder}
                  placeholder="Örn: Dr. Mars Parfüm Ltd. Şti."
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">IBAN Numarası</label>
                <input
                  name="bank2Iban"
                  defaultValue={bank2.iban}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs font-mono font-bold outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Şube Adı / Kodu</label>
                <input
                  name="bank2Branch"
                  defaultValue={bank2.branch}
                  placeholder="Örn: Artuklu Şubesi"
                  className="w-full rounded border border-stone-300 bg-white p-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="rounded-xl bg-[#101e2c] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-black transition-colors"
        >
          Tüm Ayarları Kaydet
        </button>
      </form>
    </main>
  );
}
