"use server";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/admin-auth";

export async function loginAction(form: FormData) {
  if (!(await signIn(String(form.get("password") ?? "")))) redirect("/yonetici-giris?error=1");
  redirect("/admin");
}

export async function logoutAction() { await signOut(); redirect("/yonetici-giris"); }
