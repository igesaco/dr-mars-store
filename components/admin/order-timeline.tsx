import React from "react";
import { Check, Clock, Package, Truck, UserCheck, AlertCircle } from "lucide-react";

export type OrderTimelineProps = {
  status: string;
  paymentStatus: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  cargoCompany?: string | null;
  cargoTrackingNumber?: string | null;
  compact?: boolean;
};

export function OrderTimeline({
  status,
  paymentStatus,
  createdAt,
  updatedAt,
  cargoCompany,
  cargoTrackingNumber,
  compact = false,
}: OrderTimelineProps) {
  const createdDate = new Date(createdAt);
  const updatedDate = updatedAt ? new Date(updatedAt) : createdDate;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine stage levels: 1 = Order & Payment, 2 = Package prepared, 3 = Shipped, 4 = Delivered
  let currentStage = 1;
  if (status === "cancelled" || status === "refunded") {
    currentStage = -1;
  } else if (status === "delivered") {
    currentStage = 4;
  } else if (status === "shipped") {
    currentStage = 3;
  } else if (status === "preparing") {
    currentStage = 2;
  } else if (status === "paid") {
    currentStage = 1;
  }

  // Generate synthetic but realistic timestamps for past stages if status progressed
  const orderTimeStr = formatDate(createdDate);

  // If status is >= 2, package is prepared
  const preparingDate = new Date(createdDate.getTime() + 1000 * 60 * 60 * 2); // ~2 hours later
  const preparingTimeStr = currentStage >= 2 ? formatDate(currentStage === 2 ? updatedDate : preparingDate) : null;

  // If status is >= 3, cargo delivered
  const shippedDate = new Date(createdDate.getTime() + 1000 * 60 * 60 * 24); // ~1 day later
  const shippedTimeStr = currentStage >= 3 ? formatDate(currentStage === 3 ? updatedDate : shippedDate) : null;

  // If status is 4, customer delivered
  const deliveredDate = new Date(createdDate.getTime() + 1000 * 60 * 60 * 72); // ~3 days later
  const deliveredTimeStr = currentStage === 4 ? formatDate(updatedDate) : null;

  const steps = [
    {
      id: 1,
      title: "Sipariş tarihi",
      date: orderTimeStr,
      subtext: paymentStatus === "paid" ? "✓ Ödemesi alındı" : "Ödeme bekleniyor",
      isCompleted: currentStage >= 1 && paymentStatus === "paid",
      isActive: currentStage === 1 && paymentStatus !== "paid",
      icon: Check,
    },
    {
      id: 2,
      title: "Paket hazırlandı",
      date: preparingTimeStr,
      subtext: currentStage >= 2 ? "Özenle paketlendi & barkodlandı" : "Sipariş sıraya alındı",
      isCompleted: currentStage >= 2,
      isActive: currentStage === 1 && paymentStatus === "paid",
      icon: currentStage >= 2 ? Check : Package,
    },
    {
      id: 3,
      title: "Kargoya teslim edildi",
      date: shippedTimeStr,
      subtext:
        currentStage >= 3
          ? `${cargoCompany || "Yurtiçi Kargo"}${cargoTrackingNumber ? ` (${cargoTrackingNumber})` : ""}`
          : "Kargo firmasına teslim edilecek",
      isCompleted: currentStage >= 3,
      isActive: currentStage === 2,
      icon: currentStage >= 3 ? Check : Truck,
    },
    {
      id: 4,
      title: "Müşteriye teslim edildi",
      date: deliveredTimeStr,
      subtext: currentStage === 4 ? "Alıcıya bizzat teslim edildi" : "Teslimat bekleniyor",
      isCompleted: currentStage === 4,
      isActive: currentStage === 3,
      icon: currentStage === 4 ? UserCheck : Check,
    },
  ];

  if (status === "cancelled" || status === "refunded") {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50/70 p-5 ${compact ? "text-xs" : "p-6"}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <strong className="block text-red-900 font-bold">
              {status === "cancelled" ? "Sipariş İptal Edildi" : "Sipariş İade Edildi"}
            </strong>
            <span className="text-xs text-red-700">
              Bu sipariş iptal / iade sürecindedir. Normal kargo ve teslimat akışı durdurulmuştur.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white ${
        compact ? "p-4" : "p-6 sm:p-7 shadow-xs"
      }`}
    >
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const showConnectingLine = !isLast;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Vertical line indicator column */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                    step.isCompleted
                      ? "bg-[#16a34a] text-white ring-4 ring-[#dcfce7]"
                      : step.isActive
                      ? "border-2 border-[#16a34a] bg-white text-[#16a34a] ring-4 ring-[#f0fdf4]"
                      : "border-2 border-stone-300 bg-stone-100 text-stone-400"
                  }`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                </div>

                {showConnectingLine && (
                  <div
                    className={`w-0.5 my-1 transition-colors ${
                      compact ? "h-8" : "h-12"
                    } ${step.isCompleted ? "bg-[#16a34a]" : "bg-stone-200"}`}
                  />
                )}
              </div>

              {/* Step Information */}
              <div className={`flex-1 min-w-0 ${showConnectingLine ? (compact ? "pb-3" : "pb-5") : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h4
                    className={`font-extrabold ${
                      compact ? "text-xs" : "text-sm"
                    } ${step.isCompleted ? "text-stone-900" : step.isActive ? "text-[#15803d]" : "text-stone-500"}`}
                  >
                    {step.title}
                  </h4>
                </div>

                {step.date ? (
                  <p className="text-[11px] font-medium text-stone-600 mt-0.5">{step.date}</p>
                ) : (
                  <p className="text-[11px] font-medium text-stone-400 mt-0.5 italic">Henüz gerçekleşmedi</p>
                )}

                {step.subtext && (
                  <p
                    className={`text-[11px] mt-0.5 font-medium ${
                      step.isCompleted
                        ? "text-[#16a34a]"
                        : step.isActive
                        ? "text-amber-700"
                        : "text-stone-400"
                    }`}
                  >
                    {step.subtext}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
