import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();
  const db = getDb();

  const customerRows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return (
    <main className="admin-main catalog-main">
      <header className="catalog-top">
        <div>
          <p className="admin-kicker">MÜŞTERİ İLİŞKİLERİ</p>
          <h1>Kayıtlı Müşteriler</h1>
          <p className="admin-lead">Kayıtlı kullanıcı profilleri, iletişim bilgileri ve üyelik durumları.</p>
        </div>
      </header>

      {/* Metrics */}
      <section className="catalog-metrics">
        <article>
          <span>Toplam Müşteri</span>
          <strong>{customerRows.length}</strong>
        </article>
        <article>
          <span>Aktif Hesaplar</span>
          <strong>{customerRows.filter((c) => c.isActive).length}</strong>
        </article>
      </section>

      {/* Table */}
      <section className="admin-panel catalog-panel">
        {customerRows.length === 0 ? (
          <p className="catalog-empty">Henüz kayıtlı müşteri hesabı bulunmuyor.</p>
        ) : (
          <div className="report-table">
            <div className="report-table-head grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4">
              <span>Müşteri Adı</span>
              <span>İletişim</span>
              <span>Rol</span>
              <span>Kayıt Tarihi</span>
              <span>Durum</span>
            </div>
            {customerRows.map((c) => (
              <div
                key={c.id}
                className="report-table-row grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 items-center"
              >
                <div>
                  <strong className="block text-sm font-bold text-stone-900">
                    {c.firstName || c.lastName ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() : "İsimsiz Kullanıcı"}
                  </strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-stone-800">{c.email}</span>
                  <small className="text-stone-500">{c.phone ?? "Telefon yok"}</small>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    {c.role}
                  </span>
                </div>
                <div>
                  <small className="text-stone-500">
                    {new Date(c.createdAt).toLocaleDateString("tr-TR", { dateStyle: "medium" })}
                  </small>
                </div>
                <div>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {c.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
