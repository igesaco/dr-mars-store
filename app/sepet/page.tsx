import type { Metadata } from "next";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { CartClient } from "./cart-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sepetim | Dr. Mars Modern Cologne",
  description: "Dr. Mars alışveriş sepetinizdeki ürünleri görüntüleyin ve siparişinizi tamamlayın.",
};

export default async function CartPage() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />
      <CartClient />
      <Footer />
    </main>
  );
}
