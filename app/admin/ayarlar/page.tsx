import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { saveSiteSettingsAction } from "./actions";

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

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">MAĞAZA YAPILANDIRMASI</p>
          <h1>Site Ayarları</h1>
          <p className="admin-lead">Duyuru bandı, kargo kuralları, iletişim ve sosyal medya ayarlarını yönet.</p>
        </div>
      </header>

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
