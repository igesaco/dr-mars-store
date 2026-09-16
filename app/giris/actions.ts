"use server";

import { redirect } from "next/navigation";
import { customerSignIn, customerSignOut, customerSignUp } from "@/lib/customer-auth";

export async function loginCustomerAction(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "").trim();

  const success = await customerSignIn(email, password);
  if (!success) {
    redirect("/giris?error=invalid_credentials");
  }

  redirect("/hesabim");
}

export async function registerCustomerAction(form: FormData) {
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const password = String(form.get("password") ?? "").trim();

  try {
    await customerSignUp({
      firstName,
      lastName,
      email,
      phone,
      password,
    });
  } catch (error: any) {
    redirect(`/kayit?error=${encodeURIComponent(error.message || "Kayit basarisiz")}`);
  }

  redirect("/hesabim");
}

export async function logoutCustomerAction() {
  await customerSignOut();
  redirect("/");
}
