"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Clock, TrendingUp, Package, ExternalLink } from "lucide-react";
import { OrderTimeline } from "@/components/admin/order-timeline";

export type OrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  subtotal: string;
  shippingAmount: string;
  createdAt: string;
  updatedAt: string;
  cargoCompany: string | null;
  cargoTrackingNumber: string | null;
  recipientName: string;
  phone: string;
  email: string;
  cost: number;
  netProfit: number;
  profitMargin: number;
};

const statuses: Record<string, { label: string; badgeClass: string }> = {
  pending: { label: "Bekliyor", badgeClass: "bg-amber-100 text-amber-800" },
  paid: { label: "Ödendi", badgeClass: "bg-blue-100 text-blue-800" },
  preparing: { label: "Hazırlanıyor", badgeClass: "bg-indigo-100 text-indigo-800" },
  shipped: { label: "Kargoda", badgeClass: "bg-purple-100 text-purple-800" },
  delivered: { label: "Teslim Edildi", badgeClass: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "İptal Edildi", badgeClass: "bg-red-100 text-red-800" },
  refunded: { label: "İade", badgeClass: "bg-stone-200 text-stone-700" },
};

export function OrdersListTable({ orders }: { orders: OrderListItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (orders.length === 0) {
    return <p className="catalog-empty">Kayıtlı sipariş bulunamadı.</p>;
  }

  return (
    <div className="report-table">
      <div className="report-table-head grid grid-cols-[1.4fr_1.4fr_1.3fr_1fr_1.3fr_auto] gap-4">
        <span>Sipariş No / Tarih</span>
        <span>Alıcı & İletişim</span>
        <span>Durum & Çizelge</span>
        <span>Ödeme</span>
        <span>Tutar & Kâr</span>
        <span>İşlem</span>
      </div>

      {orders.map((o) => {
        const st = statuses[o.status] ?? { label: o.status, badgeClass: "bg-stone-100" };
        const isExpanded = expandedId === o.id;

        return (
          <div key={o.id} className="border-b border-stone-200 last:border-b-0">
            {/* Main Row */}
            <div className="report-table-row grid grid-cols-[1.4fr_1.4fr_1.3fr_1fr_1.3fr_auto] gap-4 items-center">
              <div>
                <strong className="block font-mono text-sm text-stone-900">{o.orderNumber}</strong>
                <small className="text-stone-400">
                  {new Date(o.createdAt).toLocaleString("tr-TR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </small>
              </div>

              <div>
                <span className="font-bold block text-stone-800 truncate">{o.recipientName}</span>
                <small className="text-stone-500">{o.phone || o.email}</small>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${st.badgeClass}`}>
                    {st.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleExpand(o.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-black transition-colors bg-stone-100 px-2 py-0.5 rounded cursor-pointer"
                    title="5. Fotoğraftaki durum çizelgesini göster"
                  >
                    <Clock size={11} />
                    <span>Akış</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <span
                  className={`inline-block text-xs font-bold ${
                    o.paymentStatus === "paid" ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {o.paymentStatus === "paid" ? "Tahsil Edildi" : "Bekliyor"}
                </span>
              </div>

              <div>
                <strong className="text-sm font-black text-stone-900 block">
                  ₺{Number(o.totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </strong>
                <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500 mt-0.5">
                  <span className={o.netProfit >= 0 ? "text-emerald-700 font-bold" : "text-red-600 font-bold"}>
                    Kâr: ₺{o.netProfit.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                  </span>
                  <span>(%{o.profitMargin.toFixed(0)})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/siparisler/${o.id}`}
                  className="rounded bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-[#101e2c] hover:text-white transition-colors"
                >
                  İncele →
                </Link>
              </div>
            </div>

            {/* Expandable Order Flow & Profit Quick View */}
            {isExpanded && (
              <div className="bg-stone-50/80 p-5 border-t border-stone-200">
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                  {/* Left: 5. Fotoğraftaki Zaman Çizelgesi */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                        <Clock size={13} className="text-[#849649]" />
                        Sipariş Durumu Akışı (Zaman Çizelgesi)
                      </h4>
                    </div>
                    <OrderTimeline
                      status={o.status}
                      paymentStatus={o.paymentStatus}
                      createdAt={o.createdAt}
                      updatedAt={o.updatedAt}
                      cargoCompany={o.cargoCompany}
                      cargoTrackingNumber={o.cargoTrackingNumber}
                      compact={true}
                    />
                  </div>

                  {/* Right: Kâr ve Maliyet Raporu */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-[#849649]" />
                      Bu Siparişin Kâr ve Maliyet Raporu
                    </h4>
                    <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>Toplam Tahsilat (Ciro):</span>
                        <strong className="text-stone-900 font-black">
                          ₺{Number(o.totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>Ürün Maliyeti (COGS):</span>
                        <strong className="text-red-700 font-bold">
                          -₺{o.cost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>Kargo Tutarı:</span>
                        <span>₺{Number(o.shippingAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t border-stone-100 pt-2 flex justify-between text-sm">
                        <span className="font-bold text-stone-800">Net Tahmini Kâr:</span>
                        <strong className={`font-black ${o.netProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                          ₺{o.netProfit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} (%{o.profitMargin.toFixed(1)})
                        </strong>
                      </div>

                      <div className="pt-2">
                        <Link
                          href={`/admin/siparisler/${o.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                        >
                          Tam sipariş detayını ve fatura adresini görüntüle <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
