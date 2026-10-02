"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { logAuditEvent } from "@/lib/audit-log";

export async function clearAllAuditLogsAction() {
  // Yalnızca Ana Yönetici (Patron / Super Admin) bu işlemi yapabilir!
  const superAdmin = await requireSuperAdmin();

  const db = getDb();
  await db.delete(adminAuditLogs);

  // Silme işlemini yeni ilk kayıt olarak güvenle ekle
  await logAuditEvent({
    action: "LOGLAR_TEMİZLENDİ",
    entityType: "security",
    description: `Tüm sistem denetim kayıtları Ana Yönetici (${superAdmin.name} - ${superAdmin.email}) tarafından temizlendi.`,
    details: {
      clearedBy: superAdmin.email,
      timestamp: new Date().toISOString(),
    },
  });

  revalidatePath("/admin/loglar");
  return { success: true };
}
