"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Search,
  Trash2,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  Activity,
  Layers,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { clearAllAuditLogsAction } from "./actions";
import { toast } from "sonner";

export type AuditLogItem = {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  details: any;
  ipAddress: string | null;
  createdAt: Date;
};

type Props = {
  initialLogs: AuditLogItem[];
  isSuperAdmin: boolean;
};

export function LogsClient({ initialLogs, isSuperAdmin }: Props) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      search === "" ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(search)) ||
      (log.entityId && log.entityId.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      selectedType === "ALL" ||
      (selectedType === "AUTH" && (log.action.includes("GİRİŞ") || log.action.includes("ÇIKIŞ"))) ||
      (selectedType === "PRODUCT" && log.entityType === "product") ||
      (selectedType === "ORDER" && (log.entityType === "order" || log.action.includes("SİPARİŞ") || log.action.includes("KARGO"))) ||
      (selectedType === "SECURITY" && (log.entityType === "security" || log.action.includes("LOGLAR") || log.entityType === "staff"));

    return matchesSearch && matchesType;
  });

  const handleClearLogs = async () => {
    if (!isSuperAdmin) {
      toast.error("Yetkisiz İşlem: Log kayıtlarını yalnızca Ana Yönetici silebilir.");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await clearAllAuditLogsAction();
      if (res.success) {
        toast.success("Denetim kayıtları başarıyla temizlendi.");
        setShowConfirmModal(false);
        // Yeni temizleme logu sayfada yenilenecektir
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err?.message || "Loglar silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes("GİRİŞ")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (action.includes("ÇIKIŞ")) {
      return "bg-stone-100 text-stone-700 border-stone-300";
    }
    if (action.includes("SİL") || action.includes("TEMİZLE")) {
      return "bg-rose-100 text-rose-800 border-rose-300";
    }
    if (action.includes("KARGO")) {
      return "bg-purple-100 text-purple-800 border-purple-300";
    }
    if (action.includes("SİPARİŞ")) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    if (action.includes("ÜRÜN")) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    return "bg-stone-100 text-stone-800 border-stone-300";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Super Admin Delete Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <ShieldAlert className="text-[#849649]" size={20} />
            <span>Denetim & Güvenlik Günlüğü</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {logs.length} Kayıt
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Yönetim panelinde yapılan tüm personel işlemleri, girişler ve veri güncellemeleri saniye saniye kaydedilir.
          </p>
        </div>

        <div>
          {isSuperAdmin ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-300 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-rose-700 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-xs"
            >
              <Trash2 size={15} />
              <span>Log Kayıtlarını Temizle</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
              <Info size={14} className="shrink-0" />
              <span>Log silme yetkisi sadece Ana Yöneticiye (Patron) aittir.</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Personel adı, e-posta, işlem, sipariş no veya IP ile ara..."
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:border-stone-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Tümü" },
            { id: "ORDER", label: "Sipariş & Kargo" },
            { id: "PRODUCT", label: "Ürünler" },
            { id: "AUTH", label: "Giriş / Çıkış" },
            { id: "SECURITY", label: "Güvenlik & Personel" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === tab.id
                  ? "bg-[#101e2c] text-white shadow-xs"
                  : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Entries Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CheckCircle2 size={36} className="mx-auto text-stone-300 mb-3" />
            <p className="text-sm font-bold text-stone-700">Kayıt bulunamadı</p>
            <p className="text-xs text-stone-400 mt-1">Arama kriterlerinize uyan işlem günlüğü yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const hasDetails = log.details && Object.keys(log.details).length > 0;

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-stone-50/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* User and Action Badge */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-black text-xs shrink-0 uppercase">
                        {log.userName.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-stone-900">{log.userName}</span>
                          <span className="text-[11px] text-stone-400 font-mono">({log.userEmail})</span>
                          <span
                            className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getActionBadge(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-stone-700 mt-1 leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta: IP and Timestamp */}
                    <div className="flex items-center gap-4 text-right shrink-0 sm:self-center">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-stone-600 justify-end">
                          <Clock size={12} className="text-stone-400" />
                          <span>
                            {new Intl.DateTimeFormat("tr-TR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }).format(new Date(log.createdAt))}
                          </span>
                        </div>
                        {log.ipAddress && (
                          <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </div>

                      {hasDetails && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
                          title="Detayları Göster"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable JSON Details */}
                  {isExpanded && hasDetails && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">
                        Teknik Detay & Veri Kaydı:
                      </p>
                      <pre className="rounded-xl bg-stone-900 p-3.5 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear Logs */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert size={24} />
            </div>

            <h3 className="text-lg font-black text-stone-950">Denetim Günlüğünü Temizle</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Tüm geçmiş işlem ve güvenlik kayıtları kalıcı olarak silinecektir. Bu işlem yalnızca Ana Yönetici tarafından yapılabilir ve geri alınamaz.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
                className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isDeleting ? "Siliniyor..." : "Evet, Tüm Kayıtları Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
