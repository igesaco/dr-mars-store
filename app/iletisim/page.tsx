import type { Metadata } from "next";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";
import { ContactClient } from "./contact-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim & Destek | Dr. Mars Modern Cologne",
  description: "Dr. Mars müşteri hizmetleri, kurumsal iletişim ve adres bilgileri.",
};

export default async function ContactPage() {
  const [navCategories, settings] = await Promise.all([
    getStoreNavCategories(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";
  const contact = settings.contact ?? {};

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      <Header categories={navCategories} announcementText={announcement} />
      <ContactClient contact={contact} />
      <Footer />
    </main>
  );
}
