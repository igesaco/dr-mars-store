import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { LogOut, Package, ShieldCheck, User } from "lucide-react";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { logoutCustomerAction } from "@/app/giris/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hesabım & Siparişlerim | Dr. Mars",
  description: "Dr. Mars müşteri profili ve sipariş geçmişi.",
};

const statuses: Record<string, { label: string; badge: string }> = {
  pending: { label: "Onay Bekliyor", badge: "bg-amber-100 text-amber-800" },
  paid: { label: "Ödeme Alındı", badge: "bg-blue-100 text-blue-800" },
  preparing: { label: "Hazırlanıyor", badge: "bg-indigo-100 text-indigo-800" },
  shipped: { label: "Kargoda", badge: "bg-purple-100 text-purple-800" },
  delivered: { label: "Teslim Edildi", badge: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "İptal Edildi", badge: "bg-red-100 text-red-800" },
  refunded: { label: "İade Edildi", badge: "bg-stone-200 text-stone-700" },
};

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/giris");
  }

  const db = getDb();
  // Kullanıcının siparişlerini ID'sine veya e-postasına göre çek
  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, customer.id))
    .orderBy(desc(orders.createdAt));

  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />

      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-12">
        {/* Top greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-8 mb-10 gap-4">
          <div>
            <p className="eyebrow dark">DR MARS KULLANICI PANELİ</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900">
              Hoş Geldiniz, {customer.firstName ?? "Değerli Müşterimiz"}
            </h1>
            <p className="mt-1 text-xs text-stone-500">{customer.email}</p>
          </div>

          <form action={logoutCustomerAction}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 hover:text-red-600 transition-colors"
            >
              <LogOut size={15} /> Çıkış Yap
            </button>
          </form>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          {/* Left: Orders */}
          <div className="space-y-6">
            <h2 className="text-lg font-black tracking-tight text-stone-900 flex items-center gap-2">
              <Package size={19} /> Geçmiş Siparişlerim ({userOrders.length})
            </h2>

            {userOrders.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
                <p className="text-sm text-stone-600">Henüz verilmiş bir siparişiniz bulunmuyor.</p>
                <Link
                  href="/kategori/kolonyalar"
                  className="mt-4 inline-block font-bold text-xs uppercase tracking-wider text-stone-950 underline"
                >
                  Koleksiyonu Keşfet →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => {
                  const st = statuses[order.status] ?? { label: order.status, badge: "bg-stone-100" };
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <strong className="font-mono text-sm font-black text-stone-900">
                            {order.orderNumber}
                          </strong>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.badge}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Tarih: {new Date(order.createdAt).toLocaleDateString("tr-TR", { dateStyle: "medium" })}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="text-base font-black text-stone-900 mr-2">
                          ₺{Number(order.totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </span>
                        <Link
                          href={`/siparis/${order.orderNumber}/fatura`}
                          target="_blank"
                          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          Fatura ↗
                        </Link>
                        <Link
                          href={`/siparis-takip?orderNumber=${order.orderNumber}&email=${customer.email}`}
                          className="rounded-lg bg-stone-100 px-4 py-2 text-xs font-bold text-stone-800 hover:bg-[#101e2c] hover:text-white transition-colors"
                        >
                          Kargo Takibi →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Account summary */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
                <User size={15} /> Profil Bilgileri
              </h3>
              <div className="space-y-2 text-xs text-stone-700">
                <p>
                  <strong>Ad Soyad:</strong> {customer.firstName} {customer.lastName}
                </p>
                <p>
                  <strong>E-posta:</strong> {customer.email}
                </p>
                <p>
                  <strong>Telefon:</strong> {customer.phone ?? "Kayıtlı telefon yok"}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-stone-400">
                Bilgilerinizi güncellemek veya destek almak için destek@drmars.com ile iletişime geçebilirsiniz.
              </div>
            </div>

            <div className="rounded-2xl bg-[#101e2c] text-white p-6 space-y-3">
              <ShieldCheck className="text-lime-300" size={24} />
              <h4 className="font-bold text-sm">Dr. Mars Ayrıcalıkları</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Kayıtlı üyelerimiz yeni çıkacak sınırlı seri kokuları ön siparişle ilk deneyimleme hakkına sahiptir.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
