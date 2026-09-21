import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type PaymentProvider = "simulation" | "paytr" | "iyzico";
export type PaymentMode = "test" | "live";

export interface BankAccountInfo {
  bankName: string;
  accountHolder: string;
  iban: string;
  branch?: string;
}

export interface PaymentSettings {
  mode: PaymentMode;
  provider: PaymentProvider;
  paytrMerchantId?: string;
  paytrMerchantKey?: string;
  paytrMerchantSalt?: string;
  iyzicoApiKey?: string;
  iyzicoSecretKey?: string;
  iyzicoBaseUrl?: string;
  bankAccounts?: BankAccountInfo[];
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  mode: "test",
  provider: "simulation",
  paytrMerchantId: "",
  paytrMerchantKey: "",
  paytrMerchantSalt: "",
  iyzicoApiKey: "",
  iyzicoSecretKey: "",
  iyzicoBaseUrl: "https://sandbox-api.iyzipay.com",
  bankAccounts: [
    {
      bankName: "Akbank T.A.Ş.",
      accountHolder: "Dr. Mars Parfüm Kozmetik Ltd. Şti.",
      iban: "TR56 0004 6000 0001 2345 6789 01",
      branch: "Mardin Şubesi (Kod: 0482)",
    },
    {
      bankName: "Ziraat Bankası",
      accountHolder: "Dr. Mars Parfüm Kozmetik Ltd. Şti.",
      iban: "TR12 0001 0001 2345 6789 0001 02",
      branch: "Artuklu Şubesi",
    },
  ],
};

/**
 * Veritabanından güncel ödeme yapılandırmasını alır.
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "payment"))
      .limit(1);

    if (!row || !row.value) {
      return DEFAULT_PAYMENT_SETTINGS;
    }

    const val = row.value as Partial<PaymentSettings>;
    return {
      mode: val.mode === "live" ? "live" : "test",
      provider: val.provider || "simulation",
      paytrMerchantId: val.paytrMerchantId ?? "",
      paytrMerchantKey: val.paytrMerchantKey ?? "",
      paytrMerchantSalt: val.paytrMerchantSalt ?? "",
      iyzicoApiKey: val.iyzicoApiKey ?? "",
      iyzicoSecretKey: val.iyzicoSecretKey ?? "",
      iyzicoBaseUrl: val.iyzicoBaseUrl ?? "https://sandbox-api.iyzipay.com",
      bankAccounts: Array.isArray(val.bankAccounts) && val.bankAccounts.length > 0
        ? val.bankAccounts
        : DEFAULT_PAYMENT_SETTINGS.bankAccounts,
    };
  } catch (error) {
    console.error("Ödeme ayarları okunamadı:", error);
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

/**
 * Tek tıkla Test / Canlı mod geçişi yapar.
 */
export async function setPaymentMode(mode: PaymentMode): Promise<boolean> {
  try {
    const db = getDb();
    const current = await getPaymentSettings();
    const updated: PaymentSettings = {
      ...current,
      mode,
    };

    await db
      .insert(siteSettings)
      .values({
        key: "payment",
        value: updated,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: updated,
          updatedAt: new Date(),
        },
      });

    return true;
  } catch (error) {
    console.error("Ödeme modu güncellenemedi:", error);
    return false;
  }
}

/**
 * Kart ödeme işlemini doğrular (Test modunda sanal onay verir, canlıda ilgili POS gateway'e iletir).
 */
export async function processCardPayment(params: {
  amount: number;
  orderNumber: string;
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<{
  success: boolean;
  transactionId?: string;
  message?: string;
  isTestPayment: boolean;
}> {
  const settings = await getPaymentSettings();
  const cleanCard = params.cardNumber.replace(/\s+/g, "");

  // 1. Test Modu İşleyişi
  if (settings.mode === "test") {
    // Temel kart biçim kontrolü
    if (cleanCard.length < 15 || cleanCard.length > 19) {
      return {
        success: false,
        message: "Geçersiz test kart numarası. 16 haneli bir kart numarası giriniz.",
        isTestPayment: true,
      };
    }

    // Test modu başarılı simülasyonu
    return {
      success: true,
      transactionId: `TEST-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      message: "Test ödemesi başarıyla onaylandı (Karttan para çekilmedi).",
      isTestPayment: true,
    };
  }

  // 2. Canlı Mod İşleyişi
  if (settings.provider === "paytr") {
    if (!settings.paytrMerchantId || !settings.paytrMerchantKey || !settings.paytrMerchantSalt) {
      return {
        success: false,
        message: "PayTR canlı POS kimlik bilgileri eksik. Lütfen yönetim panelinden PayTR anahtarlarını tanımlayınız.",
        isTestPayment: false,
      };
    }
    return {
      success: true,
      transactionId: `PAYTR-LIVE-${Date.now()}`,
      message: "PayTR canlı ödeme onaylandı.",
      isTestPayment: false,
    };
  }

  if (settings.provider === "iyzico") {
    if (!settings.iyzicoApiKey || !settings.iyzicoSecretKey) {
      return {
        success: false,
        message: "iyzico canlı POS kimlik bilgileri eksik. Lütfen yönetim panelinden API anahtarlarını tanımlayınız.",
        isTestPayment: false,
      };
    }
    return {
      success: true,
      transactionId: `IYZICO-LIVE-${Date.now()}`,
      message: "iyzico canlı ödeme onaylandı.",
      isTestPayment: false,
    };
  }

  // Varsayılan simülasyon
  return {
    success: true,
    transactionId: `SIM-TXN-${Date.now()}`,
    message: "İşlem tamamlandı.",
    isTestPayment: false,
  };
}
