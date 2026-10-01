import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { getCargoSettings, generateBarcodeSvg } from "@/lib/cargo-service";
import { Printer, ArrowLeft, Truck, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CargoLabelPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (!order) {
    notFound();
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const cargoSettings = await getCargoSettings();

  const addr = (order.shippingAddress as Record<string, string>) || {};
  const trackingNumber = order.cargoTrackingNumber || order.orderNumber;
  const isCod = order.paymentStatus !== "paid";
  const cargoCompany = order.cargoCompany || "Yurtiçi Kargo";

  // Code-128 SVG Barkodu oluştur
  const barcodeSvg = generateBarcodeSvg(trackingNumber, {
    height: 70,
    width: 320,
    showText: true,
  });

  const orderDate = new Date(order.createdAt).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 print:bg-white print:p-0">
      {/* Üst Yönetim Araç Çubuğu (Yazdırma esnasında gizlenir) */}
      <div className="max-w-[420px] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden">
        <Link
          href={`/admin/siparisler/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Siparişe Geri Dön</span>
        </Link>

        <button
          onClick={undefined}
          id="print-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-[#101e2c] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-black transition-all cursor-pointer"
        >
          <Printer size={15} />
          <span>Etiketi Yazdır</span>
        </button>
      </div>

      {/* 
        STANDART KARGO GÖNDERİ ETİKETİ (100x150 mm / A6 Termal Etiket Formatı)
      */}
      <div
        className="max-w-[420px] mx-auto bg-white border-2 border-black rounded-lg p-5 shadow-lg print:shadow-none print:border-2 print:border-black print:rounded-none print:max-w-none print:w-full print:m-0 font-sans text-black"
        style={{ minHeight: "600px" }}
      >
        {/* Üst Başlık & Taşıyıcı Firma Bilgisi */}
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Truck size={20} className="text-black" />
                <h1 className="text-xl font-black uppercase tracking-wider">{cargoCompany}</h1>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                E-TİCARET TAŞIMA & SEVK ETİKETİ
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block border border-black px-2 py-0.5 text-[10px] font-black uppercase">
                STANDART KARGO
              </span>
              <p className="text-[10px] font-mono mt-1">{orderDate}</p>
            </div>
          </div>
        </div>

        {/* Ana Barkod Alanı */}
        <div className="py-4 border-b-2 border-black text-center bg-white">
          <div
            className="flex justify-center"
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
          <div className="mt-1 flex items-center justify-between text-xs font-mono font-bold px-2">
            <span>Sipariş No: #{order.orderNumber}</span>
            <span>Koli: 1/1</span>
          </div>
        </div>

        {/* Alıcı (Müşteri) Bilgileri - Çok Belirgin ve Büyük */}
        <div className="py-3 border-b-2 border-black">
          <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">
            ALICI (TESLİMAT ADRESİ)
          </p>
          <h2 className="text-lg font-black uppercase leading-tight text-black">
            {addr.recipientName || "Sayın Müşteri"}
          </h2>
          <p className="text-sm font-bold mt-1 text-black font-mono">
            {addr.phone || "Telefon Belirtilmedi"}
          </p>
          <p className="text-xs font-medium mt-1 leading-snug text-stone-900">
            {addr.addressLine}
          </p>
          <div className="mt-2 inline-block bg-black text-white px-2 py-1 text-sm font-black uppercase tracking-wider">
            {addr.district} / {addr.city}
          </div>
        </div>

        {/* Ödeme Durumu / Tahsilat Kutusu */}
        <div className="py-3 border-b-2 border-black">
          {isCod ? (
            <div className="border-2 border-black bg-stone-100 p-2 text-center rounded">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-red-600 uppercase">
                <AlertTriangle size={15} />
                <span>KAPIDA ÖDEMELİ GÖNDERİ</span>
              </div>
              <p className="text-base font-black mt-0.5 text-black">
                TAHSİL EDİLECEK TUTAR: ₺{Number(order.totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ) : (
            <div className="border border-black bg-stone-50 p-2 text-center rounded">
              <p className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                ✓ PEŞİN ÖDENDİ (ÜCRET TAHSİL EDİLMEYECEK)
              </p>
            </div>
          )}
        </div>

        {/* Gönderici Mağaza Bilgileri */}
        <div className="py-3 border-b border-stone-300 text-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">
            GÖNDERİCİ (MAĞAZA ÇIKIŞ)
          </p>
          <p className="font-bold text-stone-900">{cargoSettings.senderName}</p>
          <p className="text-[11px] text-stone-700 leading-snug">
            {cargoSettings.senderAddress}, {cargoSettings.senderDistrict} / {cargoSettings.senderCity}
          </p>
          <p className="text-[11px] text-stone-700 font-mono mt-0.5">
            Tel: {cargoSettings.senderPhone} {cargoSettings.yurticiCustomerCode ? `| Müşteri No: ${cargoSettings.yurticiCustomerCode}` : ""}
          </p>
        </div>

        {/* Sipariş İçerik Özeti & Kırılabilir Uyarısı */}
        <div className="pt-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 mb-1.5">
            <span>İÇERİK ÖZETİ ({items.length} Kalem)</span>
            <span className="font-black text-red-600">⚠️ DİKKAT: KIRILABİLİR CAM ŞİŞE</span>
          </div>
          <div className="text-[10px] text-stone-600 space-y-0.5">
            {items.map((item) => (
              <p key={item.id} className="truncate">
                • {item.productName} ({item.variantName || "Standart"}) × {item.quantity} Adet
              </p>
            ))}
          </div>
        </div>

        {/* Dipnot / Güvenlik */}
        <div className="mt-4 pt-2 border-t border-stone-200 flex justify-between items-center text-[9px] text-stone-400">
          <span>Dr. Mars Parfumerie & Apothecary</span>
          <span>Barkod Doğrulama: OK</span>
        </div>
      </div>

      {/* Yazdırma Tetikleyici Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-btn')?.addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />
    </div>
  );
}
