"use client";

import { useState } from "react";
import {
  UserCheck,
  UserPlus,
  Shield,
  KeyRound,
  Mail,
  Trash2,
  Power,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { createStaffAction, toggleStaffStatusAction, deleteStaffAction } from "./actions";
import { toast } from "sonner";

export type StaffItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

type Props = {
  initialStaff: StaffItem[];
  isSuperAdmin: boolean;
};

export function StaffClient({ initialStaff, isSuperAdmin }: Props) {
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "editor">("manager");
  const [giveSuperAdmin, setGiveSuperAdmin] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      toast.error("Lütfen gerekli alanları doldurun.");
      return;
    }
    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("firstName", firstName);
    fd.append("lastName", lastName);
    fd.append("email", email);
    fd.append("password", password);
    fd.append("role", role);
    if (giveSuperAdmin) fd.append("isSuperAdmin", "true");

    try {
      const res = await createStaffAction(fd);
      if (res.success) {
        toast.success("Personel hesabı başarıyla oluşturuldu.");
        setShowAddModal(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setGiveSuperAdmin(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Personel eklenemedi.");
      }
    } catch {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: StaffItem) => {
    try {
      const res = await toggleStaffStatusAction(user.id, user.isActive);
      if (res.success) {
        toast.success(`Hesap durumu ${!user.isActive ? "Aktif" : "Pasif"} yapıldı.`);
        setStaffList((prev) =>
          prev.map((s) => (s.id === user.id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch {
      toast.error("Durum güncellenemedi.");
    }
  };

  const handleDelete = async (user: StaffItem) => {
    if (!isSuperAdmin) {
      toast.error("Personel silme yetkisi yalnızca Admin'e aittir.");
      return;
    }
    if (!confirm(`${user.firstName || user.email} adlı personeli kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await deleteStaffAction(user.id);
      if (res.success) {
        toast.success("Personel hesabı silindi.");
        setStaffList((prev) => prev.filter((s) => s.id !== user.id));
      }
    } catch (err: any) {
      toast.error(err?.message || "Silme başarısız.");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return { label: "Mağaza Yöneticisi", class: "bg-purple-100 text-purple-900 border-purple-300" };
      case "manager":
        return { label: "Sipariş & Kargo Yetkilisi", class: "bg-blue-100 text-blue-900 border-blue-300" };
      case "editor":
        return { label: "Ürün & Katalog Editörü", class: "bg-amber-100 text-amber-900 border-amber-300" };
      default:
        return { label: "Personel", class: "bg-stone-100 text-stone-800 border-stone-300" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <UserCheck className="text-[#849649]" size={20} />
            <span>Yönetici & Personel Hesapları</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {staffList.length + 1} Aktif Hesap
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Panelinize erişebilen yetkilileri tanımlayın; personelin yaptığı tüm hareketler denetim günlüğünde kayıt altına alınır.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#101e2c] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-black transition-all cursor-pointer shadow-sm shrink-0"
        >
          <UserPlus size={15} />
          <span>Yeni Personel Ekle</span>
        </button>
      </div>

      {/* Root Master Account Card */}
      <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#c5a880]/40 bg-gradient-to-r from-[#101e2c] via-[#142334] to-[#101e2c] text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#dfcca8] via-[#c5a880] to-[#8f7351] text-[#101e2c] flex items-center justify-center font-black text-base shadow">
              ★
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-white">
                  Admin Hesabı (Ana Yönetici)
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#c5a880]/30 border border-[#c5a880]/50 text-[#dfcca8] text-[9px] font-black uppercase tracking-widest">
                  MUTLAK YETKİLİ
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 font-mono">
                admin@drmars.com.tr (veya doğrudan sunucu ana şifreniz)
              </p>
            </div>
          </div>

          <div className="text-xs text-stone-400 sm:text-right max-w-sm">
            <span className="text-[11px] text-[#dfcca8] font-bold block mb-0.5">
              🛡️ Logları Silme & Sistem Sahibi
            </span>
            İşlem log kayıtlarını yalnızca bu ana hesap temizleyebilir.
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Personel Adı</th>
                <th className="py-3.5 px-4">E-posta</th>
                <th className="py-3.5 px-4">Yetki Alanı (Rol)</th>
                <th className="py-3.5 px-4">Özel Yetki</th>
                <th className="py-3.5 px-4">Son Giriş</th>
                <th className="py-3.5 px-4">Durum</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-500 font-medium">
                    Henüz ek bir personel hesabı açılmadı. Sağ üstteki butondan ilk personelinizi ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                staffList.map((user) => {
                  const roleMeta = getRoleLabel(user.role);

                  return (
                    <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-black text-stone-900">
                        {user.firstName} {user.lastName || ""}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${roleMeta.class}`}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#8f7351] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            ★ Super Admin
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">Standart</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                        {user.lastLoginAt ? (
                          new Intl.DateTimeFormat("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(user.lastLoginAt))
                        ) : (
                          <span className="text-stone-300">Henüz girmedi</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                            user.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {user.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-black hover:bg-stone-100 transition-all cursor-pointer"
                            title={user.isActive ? "Hesabı Dondur (Pasif Yap)" : "Hesabı Aktif Et"}
                          >
                            <Power size={14} className={user.isActive ? "text-emerald-600" : "text-stone-400"} />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                              title="Personeli Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#101e2c] text-white flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-950">Yeni Personel Tanımla</h3>
                <p className="text-xs text-stone-500">Personel bu e-posta ve şifreyle panele giriş yapacaktır.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Ad *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Örn: Mehmet"
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Örn: Kaya"
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mehmet@drmars.com.tr"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Giriş Şifresi * (En az 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Yetki Alanı (Rol)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-none bg-white"
                >
                  <option value="manager">Sipariş & Kargo Yetkilisi (Sipariş, kargo etiketi, takip)</option>
                  <option value="editor">Ürün & Katalog Editörü (Ürün ekleme, fiyat, stok, yorum)</option>
                  <option value="admin">Mağaza Yöneticisi (Tüm e-ticaret sayfaları)</option>
                </select>
              </div>

              {isSuperAdmin && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giveSuperAdmin}
                      onChange={(e) => setGiveSuperAdmin(e.target.checked)}
                      className="rounded text-amber-700 focus:ring-amber-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-amber-950">
                      ★ Bu kullanıcıya Admin yetkisi ver
                    </span>
                  </label>
                  <p className="text-[11px] text-amber-800 mt-1 pl-6">
                    Bu kutuyu işaretlerseniz, bu kullanıcı da sizin gibi denetim günlüğünü (logları) silebilir.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#101e2c] px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-black disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSubmitting ? "Ekleniyor..." : "Hesabı Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
