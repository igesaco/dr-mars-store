import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { saveCouponAction, toggleCouponAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdmin();
  const db = getDb();
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">PAZARLAMA / PROMOSYON</p>
          <h1>Kuponlar & İndirimler</h1>
          <p className="admin-lead">Yüzdelik veya sabit TL indirim kuponları tanımla ve sınırlarını yönet.</p>
        </div>
      </header>

      <div className="category-layout">
        {/* New Coupon Form */}
        <section className="editor-card category-create">
          <div className="editor-title">
            <span>+</span>
            <div>
              <h2>Yeni Kupon Ekle</h2>
              <p>Promosyon kodu ve kural tanımları.</p>
            </div>
          </div>
          <form action={saveCouponAction} className="category-form">
            <label>
              Kupon Kodu *
              <input
                name="code"
                required
                maxLength={64}
                placeholder="Örn: YAZ20 veya DRMARS50"
                className="uppercase font-mono"
              />
            </label>

            <label>
              İndirim Tipi *
              <select name="type" defaultValue="percent" className="w-full rounded border p-2 text-xs bg-white">
                <option value="percent">Yüzdelik (%) İndirim</option>
                <option value="fixed">Sabit (TL) İndirim</option>
              </select>
            </label>

            <label>
              İndirim Değeri *
              <input
                name="value"
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="Örn: 10 veya 100"
              />
            </label>

            <label>
              Minimum Sepet Tutarı (TL)
              <input
                name="minimumOrderAmount"
                type="number"
                step="1"
                placeholder="Örn: 500 (Boşsa limitsiz)"
              />
            </label>

            <label>
              Kullanım Limiti (Adet)
              <input
                name="usageLimit"
                type="number"
                step="1"
                placeholder="Örn: 200 (Boşsa sınırsız)"
              />
            </label>

            <label className="editor-featured">
              <input name="isActive" type="checkbox" defaultChecked /> Kupon Aktif
            </label>

            <button type="submit">Kuponu Kaydet</button>
          </form>
        </section>

        {/* Existing Coupons List */}
        <section className="admin-panel category-list">
          <div className="panel-title">
            <div>
              <p className="admin-kicker">KUPON LİSTESİ</p>
              <h2>{rows.length} Kupon</h2>
            </div>
          </div>

          {rows.map((row) => (
            <article className="category-row flex items-center justify-between p-4 border-b border-stone-100" key={row.id}>
              <div>
                <strong className="text-base font-mono font-black text-stone-900 block">
                  {row.code}
                </strong>
                <p className="text-xs text-stone-600 mt-1">
                  {row.type === "percent" ? `%${Number(row.value)} İndirim` : `₺${Number(row.value)} İndirim`}
                  {row.minimumOrderAmount && ` · Min: ₺${Number(row.minimumOrderAmount)}`}
                  {` · Kullanım: ${row.usageCount} / ${row.usageLimit ?? "Sınırsız"}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${row.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>
                  {row.isActive ? "Aktif" : "Pasif"}
                </span>

                <form action={toggleCouponAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="active" value={row.isActive ? "false" : "true"} />
                  <button
                    type="submit"
                    className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100"
                  >
                    {row.isActive ? "Pasife Al" : "Aktifleştir"}
                  </button>
                </form>
              </div>
            </article>
          ))}

          {rows.length === 0 && <p className="catalog-empty">Henüz tanımlı kupon bulunmuyor.</p>}
        </section>
      </div>
    </main>
  );
}
