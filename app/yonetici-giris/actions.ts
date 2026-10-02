"use server";
import { redirect } from "next/navigation";
import { getCurrentAdmin, signIn, signOut } from "@/lib/admin-auth";
import { logAuditEvent } from "@/lib/audit-log";

export async function loginAction(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "").trim();

  // Eğer sadece şifre girilmişse signIn'e şifreyi ilet, e-posta da varsa ikisini ilet
  const success = email ? await signIn(email, password) : await signIn(password);
  
  if (!success) {
    redirect("/yonetici-giris?error=1");
  }

  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin && !currentAdmin.isSuperAdmin) {
    await logAuditEvent({
      action: "GİRİŞ_YAPILDI",
      entityType: "auth",
      description: `${currentAdmin.name || email || "Personel"} yönetim paneline giriş yaptı.`,
    });
  }

  redirect("/admin");
}

export async function logoutAction() {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin && !currentAdmin.isSuperAdmin) {
    await logAuditEvent({
      action: "ÇIKIŞ_YAPILDI",
      entityType: "auth",
      description: `${currentAdmin.name || currentAdmin.email} oturumunu kapattı.`,
    });
  }
  await signOut();
  redirect("/yonetici-giris");
}
