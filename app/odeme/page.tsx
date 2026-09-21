import type { Metadata } from "next";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { getPaymentSettings } from "@/lib/payment-service";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Güvenli Ödeme & Checkout | Dr. Mars",
  description: "Dr. Mars siparişinizi güvenle tamamlayın.",
};

export default async function CheckoutPage() {
  const [navCategories, settings, paymentSettings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
    getPaymentSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />
      <CheckoutClient paymentSettings={paymentSettings} />
      <Footer />
    </main>
  );
}
