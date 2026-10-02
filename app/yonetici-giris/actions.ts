"use server";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/admin-auth";
import { logAuditEvent } from "@/lib/audit-log";

export async function loginAction(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "").trim();

  // Eğer sadece şifre girilmişse signIn'e şifreyi ilet, e-posta da varsa ikisini ilet
  const success = email ? await signIn(email, password) : await signIn(password);
  
  if (!success) {
    redirect("/yonetici-giris?error=1");
  }

  await logAuditEvent({
    action: "GİRİŞ_YAPILDI",
    entityType: "auth",
    description: `${email || "Ana Yönetici (Patron)"} yönetim paneline giriş yaptı.`,
  });

  redirect("/admin");
}

export async function logoutAction() {
  await logAuditEvent({
    action: "ÇIKIŞ_YAPILDI",
    entityType: "auth",
    description: "Yönetici oturumunu kapattı.",
  });
  await signOut();
  redirect("/yonetici-giris");
}
