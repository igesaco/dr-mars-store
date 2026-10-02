"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentAdmin, hashAdminPassword, requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import { logAuditEvent } from "@/lib/audit-log";

export async function createStaffAction(form: FormData) {
  const currentAdmin = await requireAdmin();
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "").trim();
  const role = String(form.get("role") ?? "editor") as "admin" | "manager" | "editor";
  const wantsSuperAdmin = form.get("isSuperAdmin") === "true";

  if (!firstName || !email || !password || password.length < 6) {
    return { success: false, error: "Lütfen ad, geçerli e-posta ve en az 6 haneli şifre girin." };
  }

  // Yalnızca mevcut Super Admin bir başkasına Super Admin yetkisi verebilir
  const isSuper = currentAdmin.isSuperAdmin && wantsSuperAdmin;

  const db = getDb();

  // E-posta mükerrerlik kontrolü
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { success: false, error: "Bu e-posta adresiyle kayıtlı bir hesap zaten var." };
  }

  const passwordHash = hashAdminPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({
      firstName,
      lastName: lastName || null,
      email,
      passwordHash,
      role,
      isSuperAdmin: isSuper,
      isActive: true,
    })
    .returning({ id: users.id, email: users.email });

  await logAuditEvent({
    action: "PERSONEL_HESABI_AÇILDI",
    entityType: "staff",
    entityId: newUser.id,
    description: `${currentAdmin.name} tarafından yeni personel (${firstName} ${lastName} - ${email}, Rol: ${role}) oluşturuldu.`,
    details: {
      staffEmail: email,
      role,
      isSuperAdmin: isSuper,
      createdBy: currentAdmin.email,
    },
  });

  revalidatePath("/admin/personel");
  return { success: true };
}

export async function toggleStaffStatusAction(userId: string, currentStatus: boolean) {
  const currentAdmin = await requireAdmin();
  const db = getDb();

  await db.update(users).set({ isActive: !currentStatus }).where(eq(users.id, userId));

  await logAuditEvent({
    action: "PERSONEL_HESABI_GÜNCELLENDİ",
    entityType: "staff",
    entityId: userId,
    description: `${currentAdmin.name} tarafından personel hesabı (${userId}) ${!currentStatus ? "Aktif" : "Pasif"} duruma getirildi.`,
  });

  revalidatePath("/admin/personel");
  return { success: true };
}

export async function deleteStaffAction(userId: string) {
  // Yalnızca Ana Yönetici personel silebilir
  const superAdmin = await requireSuperAdmin();
  const db = getDb();

  const [deletedUser] = await db.delete(users).where(eq(users.id, userId)).returning({ email: users.email, firstName: users.firstName });

  await logAuditEvent({
    action: "PERSONEL_HESABI_SİLİNDİ",
    entityType: "staff",
    entityId: userId,
    description: `Ana Yönetici (${superAdmin.name}) tarafından personel hesabı (${deletedUser?.email || userId}) kalıcı olarak silindi.`,
  });

  revalidatePath("/admin/personel");
  return { success: true };
}
