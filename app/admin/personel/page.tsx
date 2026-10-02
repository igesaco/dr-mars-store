import { desc, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentAdmin, requireAdmin } from "@/lib/admin-auth";
import { StaffClient } from "./staff-client";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const currentAdmin = await requireAdmin();
  const db = getDb();

  let staffRows: any[] = [];
  try {
    staffRows = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        isSuperAdmin: users.isSuperAdmin,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.role, ["admin", "manager", "editor"]))
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Personeller yüklenirken hata:", error);
    staffRows = [];
  }

  return (
    <div className="space-y-6">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">KULLANICI & YETKİLENDİRME</p>
          <h1>Personel & Yönetici Hesapları</h1>
        </div>
      </header>

      <StaffClient initialStaff={staffRows} isSuperAdmin={currentAdmin.isSuperAdmin} />
    </div>
  );
}
