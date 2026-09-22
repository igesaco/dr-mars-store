import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { InvoicePrintButton } from "@/components/invoice/invoice-print-button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export const metadata: Metadata = {
  title: "E-Arşiv Fatura Bilgisi | Dr. Mars",
  description: "Dr. Mars sipariş faturası ve e-arşiv belgesi.",
};

export default async function InvoicePage({ params }: Props) {
  const { orderNumber } = await params;
  const db = getDb();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  if (!order) {
    notFound();
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const address = order.shippingAddress as Record<string, string>;
  const billing = (order.billingAddress as Record<string, string>) || address;

  // KDV hesaplamaları (Türkiye %20 KDV dahil standart)
  const totalAmount = Number(order.totalAmount);
  const kdvAmount = (totalAmount * 20) / 120;
  const netAmount = totalAmount - kdvAmount;

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between no-print">
        <Link
          href={`/siparis-tamamlandi/${order.orderNumber}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} /> Sipariş Detayına Dön
        </Link>
        <div className="flex items-center gap-3">
          <InvoicePrintButton label="Faturayı / Fişi Yazdır" />
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div className="mx-auto max-w-4xl bg-white border border-stone-200 shadow-lg print:shadow-none print:border-none rounded-2xl print:rounded-none p-8 sm:p-14 text-stone-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-stone-200 pb-8">
          <div>
            <div className="text-3xl font-black tracking-tighter text-[#101e2c]">
              DR MARS
            </div>
            <p className="text-xs font-bold tracking-widest text-[#849649] uppercase mt-1">
              Modern Cologne & Atelier
            </p>
            <div className="mt-3 text-xs text-stone-500 leading-relaxed font-sans">
              <p className="font-semibold text-stone-700">Dr. Mars Kozmetik Kimya Sanayi ve Ticaret Ltd. Şti.</p>
              <p>Şar Mah. 1. Cadde No: 284 Artuklu / Mardin</p>
              <p>Fabrika: Mardin OSB 2. Cadde No: 14 Artuklu / Mardin</p>
              <p>Vergi Dairesi: Mardin V.D. | VKN: 2340981249</p>
              <p>Mersis: 0234098124900001</p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="inline-block rounded bg-stone-900 px-3 py-1 text-xs font-black tracking-widest text-white uppercase mb-2">
              E-ARŞİV FATURA / SİPARİŞ FİŞİ
            </span>
            <p className="text-xs font-bold text-stone-500">Belge No:</p>
            <p className="text-sm font-mono font-black text-stone-900 tracking-wider">
              DRM-{order.orderNumber}
            </p>
            <div className="mt-3 text-xs text-stone-600 space-y-0.5">
              <p>
                <span className="text-stone-400">Düzenleme Tarihi:</span>{" "}
                <strong>
                  {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </strong>
              </p>
              <p>
                <span className="text-stone-400">Saat:</span>{" "}
                <strong>
                  {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </p>
              <p>
                <span className="text-stone-400">Ödeme Durumu:</span>{" "}
                <strong className="text-emerald-700 uppercase">
                  {order.paymentStatus === "paid" ? "ÖDENDİ" : "BEKLİYOR"}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Customer / Recipient Info */}
        <div className="grid sm:grid-cols-2 gap-8 py-8 border-b border-stone-200 text-xs">
          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-stone-400 mb-2">
              Sayın (Fatura / Alıcı Bilgileri)
            </h3>
            <p className="text-base font-black text-stone-900">
              {billing.companyName || billing.recipientName || address.recipientName}
            </p>
            <p className="text-stone-800 leading-relaxed font-medium mt-1">
              {billing.addressLine || address.addressLine}
            </p>
            <p className="text-stone-800 font-bold">
              {billing.district || address.district} / {billing.city || address.city} {billing.postalCode || address.postalCode}
            </p>
            <p className="text-stone-600 mt-2">
              <strong>İletişim:</strong> {billing.phone || address.phone} {address.email ? `• ${address.email}` : ""}
            </p>
            <p className="text-stone-700 mt-1 font-mono font-medium">
              {billing.taxNumber
                ? `VKN: ${billing.taxNumber} (${billing.taxOffice || "Vergi Dairesi"})`
                : billing.idNumber
                ? `T.C. Kimlik No: ${billing.idNumber}`
                : "T.C. / VKN: 11111111111 (Nihai Tüketici)"}
            </p>
          </div>

          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-stone-400 mb-2">
              Teslimat & Sevk Adresi
            </h3>
            <p className="text-sm font-bold text-stone-900">{address.recipientName}</p>
            <p className="text-stone-800 leading-relaxed font-medium mt-1">
              {address.addressLine}
            </p>
            <p className="text-stone-800 font-bold mt-1">
              {address.district} / {address.city} {address.postalCode}
            </p>
            <p className="text-stone-500 mt-2">
              Kargo Firması: <strong>{order.cargoCompany ?? "Yurtiçi Kargo"}</strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-900 text-stone-900 font-black uppercase tracking-wider">
                <th className="py-3">No</th>
                <th className="py-3">Mal / Hizmet Açıklaması</th>
                <th className="py-3 text-center">Miktar</th>
                <th className="py-3 text-right">Birim Fiyat</th>
                <th className="py-3 text-center">KDV</th>
                <th className="py-3 text-right">Toplam Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {items.map((item, idx) => (
                <tr key={item.id} className="py-3">
                  <td className="py-3.5 font-mono text-stone-400">{idx + 1}</td>
                  <td className="py-3.5">
                    <p className="font-bold text-stone-900">{item.productName}</p>
                    <p className="text-[11px] text-stone-500">
                      {item.variantName} {item.sku ? `· SKU: ${item.sku}` : ""}
                    </p>
                  </td>
                  <td className="py-3.5 text-center font-bold text-stone-800">
                    {item.quantity} Adet
                  </td>
                  <td className="py-3.5 text-right font-mono text-stone-700">
                    ₺{Number(item.unitPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-center font-mono text-stone-500">%20</td>
                  <td className="py-3.5 text-right font-mono font-bold text-stone-900">
                    ₺{Number(item.lineTotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-stone-900 pt-6">
          <div className="text-xs text-stone-500 max-w-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 size={16} />
              <span>Elektronik İmzalı Resmi E-Arşiv Belgesidir.</span>
            </div>
            <p className="leading-relaxed">
              İşbu fatura 213 sayılı V.U.K. hükümlerine istinaden tanzim edilmiş olup, kaşe ve imza yerine geçer.
            </p>
            {order.customerNote && (
              <div className="rounded bg-stone-50 p-2.5 border border-stone-200 text-stone-700">
                <span className="font-bold block text-[11px] text-stone-500">Müşteri Notu:</span>
                <p className="italic">{order.customerNote}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Mal / Hizmet Tutarı (KDV Hariç):</span>
              <span className="font-mono">
                ₺{netAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Hesaplanan KDV (%20):</span>
              <span className="font-mono">
                ₺{kdvAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>İndirim Tutarı ({order.couponCode ?? "Kupon"}):</span>
                <span className="font-mono">
                  -₺{Number(order.discountAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Kargo Bedeli:</span>
              <span className="font-mono">
                {Number(order.shippingAmount) === 0
                  ? "Ücretsiz"
                  : `₺${Number(order.shippingAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="flex justify-between font-black text-base text-stone-950 pt-3 border-t-2 border-stone-900">
              <span>ÖDENECEK TOPLAM:</span>
              <span className="font-mono text-lg">
                ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Barcode / Thank you */}
        <div className="mt-12 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#849649]" />
            <span>Dr. Mars Modern Parfümeri & Kolonya San. Tic. Ltd. Şti.</span>
          </div>
          <span className="font-mono">Barkod Ref: *{order.orderNumber}*</span>
        </div>
      </div>
    </div>
  );
}
