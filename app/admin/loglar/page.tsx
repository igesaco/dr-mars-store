import { desc, not, and, ilike } from "drizzle-orm";
import { getDb } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { getCurrentAdmin, requireAdmin } from "@/lib/admin-auth";
import { LogsClient } from "./logs-client";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const currentAdmin = await requireAdmin();
  const db = getDb();

  let rawLogs: any[] = [];
  try {
    rawLogs = await db
      .select({
        id: adminAuditLogs.id,
        userName: adminAuditLogs.userName,
        userEmail: adminAuditLogs.userEmail,
        userRole: adminAuditLogs.userRole,
        action: adminAuditLogs.action,
        entityType: adminAuditLogs.entityType,
        entityId: adminAuditLogs.entityId,
        description: adminAuditLogs.description,
        details: adminAuditLogs.details,
        ipAddress: adminAuditLogs.ipAddress,
        createdAt: adminAuditLogs.createdAt,
      })
      .from(adminAuditLogs)
      .where(
        and(
          not(ilike(adminAuditLogs.userName, "%patron%")),
          not(ilike(adminAuditLogs.userName, "%ana yönetici%")),
          not(ilike(adminAuditLogs.userEmail, "%patron@%")),
          not(ilike(adminAuditLogs.userEmail, "%admin@drmars.com.tr%")),
          not(ilike(adminAuditLogs.description, "%patron%")),
          not(ilike(adminAuditLogs.description, "%1568serhat1568@gmail.com%"))
        )
      )
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(300);
  } catch (error) {
    console.error("Denetim kayıtları çekilirken hata:", error);
    rawLogs = [];
  }

  return (
    <div className="space-y-6">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">GÜVENLİK & DENETİM</p>
          <h1>İşlem & Güvenlik Günlüğü</h1>
        </div>
      </header>

      <LogsClient initialLogs={rawLogs} isSuperAdmin={currentAdmin.isSuperAdmin} />
    </div>
  );
}
