import { headers } from "next/headers";
import { getDb } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { getCurrentAdmin } from "@/lib/admin-auth";

export type AuditActionType =
  | "GİRİŞ_YAPILDI"
  | "ÇIKIŞ_YAPILDI"
  | "ÜRÜN_EKLENDİ"
  | "ÜRÜN_GÜNCELLENDİ"
  | "ÜRÜN_SİLİNDİ"
  | "SİPARİŞ_DURUMU_GÜNCELLENDİ"
  | "KARGO_ETİKETİ_YAZDIRILDI"
  | "KARGO_TAKİP_GİRİLDİ"
  | "KUPON_EKLENDİ"
  | "KUPON_GÜNCELLENDİ"
  | "KUPON_SİLİNDİ"
  | "KATEGORİ_GÜNCELLENDİ"
  | "SİTE_AYARI_GÜNCELLENDİ"
  | "PERSONEL_HESABI_AÇILDI"
  | "PERSONEL_HESABI_GÜNCELLENDİ"
  | "PERSONEL_HESABI_SİLİNDİ"
  | "LOGLAR_TEMİZLENDİ"
  | "DİĞER_İŞLEM";

export async function logAuditEvent(params: {
  action: AuditActionType | string;
  entityType: "product" | "order" | "coupon" | "category" | "review" | "settings" | "auth" | "staff" | "security";
  entityId?: string;
  description: string;
  details?: Record<string, any>;
  actorOverride?: {
    id?: string;
    name: string;
    email: string;
    role: string;
    isSuperAdmin?: boolean;
  };
}) {
  try {
    const admin = params.actorOverride ?? (await getCurrentAdmin());

    // Admin'in (Süper Admin / Ana Yönetici) işlemleri loglarda gözükmesin (yalnızca personel işlemleri kaydedilsin)
    if (
      admin?.isSuperAdmin ||
      admin?.id === "root-master" ||
      admin?.id?.startsWith("root") ||
      admin?.email === "admin@drmars.com.tr" ||
      admin?.email === "patron@drmars.com.tr"
    ) {
      return;
    }

    let ip = "127.0.0.1";
    try {
      const headerList = await headers();
      const forwarded = headerList.get("x-forwarded-for");
      ip = (forwarded ? forwarded.split(",")[0] : headerList.get("x-real-ip")) || "127.0.0.1";
    } catch {
      // Header available only during requests
    }

    const db = getDb();
    await db.insert(adminAuditLogs).values({
      userId: admin?.id && !admin.id.startsWith("root") ? admin.id : null,
      userName: admin?.name || "Bilinmeyen Yönetici",
      userEmail: admin?.email || "admin@drmars.com.tr",
      userRole: admin?.role || "admin",
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || null,
      description: params.description,
      details: params.details || null,
      ipAddress: ip,
    });
  } catch (error) {
    console.error("Denetim günlüğü kaydedilemedi:", error);
  }
}
