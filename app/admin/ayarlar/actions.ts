"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export async function saveSiteSettingsAction(form: FormData) {
  await requireAdmin();
  const db = getDb();

  const announcementText = String(form.get("announcementText") ?? "").trim();
  const announcementActive = form.get("announcementActive") === "on";

  const freeThreshold = Number(form.get("freeThreshold") ?? 1500);
  const standardCost = Number(form.get("standardCost") ?? 59);
  const cargoCompany = String(form.get("cargoCompany") ?? "Yurtiçi Kargo").trim();

  const phone = String(form.get("phone") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const workingHours = String(form.get("workingHours") ?? "").trim();

  const instagram = String(form.get("instagram") ?? "").trim();
  const facebook = String(form.get("facebook") ?? "").trim();

  // Ödeme ve Sanal POS Ayarları
  const paymentMode = form.get("paymentMode") === "live" ? "live" : "test";
  const paymentProvider = String(form.get("paymentProvider") ?? "simulation");
  const paytrMerchantId = String(form.get("paytrMerchantId") ?? "").trim();
  const paytrMerchantKey = String(form.get("paytrMerchantKey") ?? "").trim();
  const paytrMerchantSalt = String(form.get("paytrMerchantSalt") ?? "").trim();
  const iyzicoApiKey = String(form.get("iyzicoApiKey") ?? "").trim();
  const iyzicoSecretKey = String(form.get("iyzicoSecretKey") ?? "").trim();
  const iyzicoBaseUrl = String(form.get("iyzicoBaseUrl") ?? "https://sandbox-api.iyzipay.com").trim();

  // Banka Hesapları
  const bank1Name = String(form.get("bank1Name") ?? "").trim();
  const bank1Holder = String(form.get("bank1Holder") ?? "").trim();
  const bank1Iban = String(form.get("bank1Iban") ?? "").trim();
  const bank1Branch = String(form.get("bank1Branch") ?? "").trim();

  const bank2Name = String(form.get("bank2Name") ?? "").trim();
  const bank2Holder = String(form.get("bank2Holder") ?? "").trim();
  const bank2Iban = String(form.get("bank2Iban") ?? "").trim();
  const bank2Branch = String(form.get("bank2Branch") ?? "").trim();

  const bankAccounts = [];
  if (bank1Iban) {
    bankAccounts.push({
      bankName: bank1Name || "Akbank T.A.Ş.",
      accountHolder: bank1Holder || "Dr. Mars Parfüm Ltd. Şti.",
      iban: bank1Iban,
      branch: bank1Branch,
    });
  }
  if (bank2Iban) {
    bankAccounts.push({
      bankName: bank2Name || "Ziraat Bankası",
      accountHolder: bank2Holder || "Dr. Mars Parfüm Ltd. Şti.",
      iban: bank2Iban,
      branch: bank2Branch,
    });
  }

  // Kargo & Lojistik API Ayarları
  const cargoMode = form.get("cargoMode") === "live" ? "live" : "test";
  const cargoProvider = String(form.get("cargoProvider") ?? "yurtici");
  const cargoUsername = String(form.get("cargoUsername") ?? "").trim();
  const cargoPassword = String(form.get("cargoPassword") ?? "").trim();
  const cargoCustomerCode = String(form.get("cargoCustomerCode") ?? "").trim();
  const cargoSenderName = String(form.get("cargoSenderName") ?? "Dr. Mars Parfüm Kozmetik Ltd. Şti.").trim();
  const cargoSenderAddress = String(form.get("cargoSenderAddress") ?? "Şar Mah. 1. Cadde No: 284").trim();
  const cargoSenderCity = String(form.get("cargoSenderCity") ?? "Mardin").trim();
  const cargoSenderDistrict = String(form.get("cargoSenderDistrict") ?? "Artuklu").trim();
  const cargoSenderPhone = String(form.get("cargoSenderPhone") ?? "+90 (482) 212 19 03").trim();

  const updates = [
    {
      key: "announcement",
      value: { text: announcementText, active: announcementActive },
    },
    {
      key: "shipping",
      value: { freeThreshold, standardCost, cargoCompany },
    },
    {
      key: "cargo",
      value: {
        mode: cargoMode,
        provider: cargoProvider,
        yurticiUsername: cargoUsername,
        yurticiPassword: cargoPassword,
        yurticiCustomerCode: cargoCustomerCode,
        senderName: cargoSenderName,
        senderAddress: cargoSenderAddress,
        senderCity: cargoSenderCity,
        senderDistrict: cargoSenderDistrict,
        senderPhone: cargoSenderPhone,
      },
    },
    {
      key: "contact",
      value: { phone, email, address, workingHours },
    },
    {
      key: "social",
      value: { instagram, facebook },
    },
    {
      key: "payment",
      value: {
        mode: paymentMode,
        provider: paymentProvider,
        paytrMerchantId,
        paytrMerchantKey,
        paytrMerchantSalt,
        iyzicoApiKey,
        iyzicoSecretKey,
        iyzicoBaseUrl,
        bankAccounts: bankAccounts.length > 0 ? bankAccounts : [
          {
            bankName: "Akbank T.A.Ş.",
            accountHolder: "Dr. Mars Parfüm Kozmetik Ltd. Şti.",
            iban: "TR56 0004 6000 0001 2345 6789 01",
            branch: "Mardin Şubesi",
          },
        ],
      },
    },
  ];

  for (const s of updates) {
    await db
      .insert(siteSettings)
      .values({ key: s.key, value: s.value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: s.value, updatedAt: new Date() },
      });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ayarlar");
  revalidatePath("/admin/siparisler");
  revalidatePath("/odeme");
}

export async function togglePaymentModeAction() {
  await requireAdmin();
  const db = getDb();

  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "payment"))
    .limit(1);

  const currentVal = (row?.value as any) ?? {};
  const newMode = currentVal.mode === "live" ? "test" : "live";

  const updatedVal = {
    ...currentVal,
    mode: newMode,
  };

  await db
    .insert(siteSettings)
    .values({
      key: "payment",
      value: updatedVal,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: updatedVal, updatedAt: new Date() },
    });

  revalidatePath("/admin");
  revalidatePath("/admin/ayarlar");
  revalidatePath("/odeme");
}

export async function toggleCargoModeAction() {
  await requireAdmin();
  const db = getDb();

  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "cargo"))
    .limit(1);

  const currentVal = (row?.value as any) ?? {};
  const newMode = currentVal.mode === "live" ? "test" : "live";

  const updatedVal = {
    ...currentVal,
    mode: newMode,
  };

  await db
    .insert(siteSettings)
    .values({
      key: "cargo",
      value: updatedVal,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: updatedVal, updatedAt: new Date() },
    });

  revalidatePath("/admin");
  revalidatePath("/admin/ayarlar");
  revalidatePath("/admin/siparisler");
}


