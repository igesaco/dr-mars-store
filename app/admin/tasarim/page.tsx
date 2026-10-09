import Link from "next/link";
import { LayoutTemplate, ShoppingBag, Sliders, Tags } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const designSections = [
  {
    title: "Duyuru Bandı & Mağaza Ayarları",
    text: "En üstte yer alan duyuru metni, kargo ücretsiz limitleri ve iletişim bilgilerini yönetin.",
    href: "/admin/ayarlar",
    badge: "AKTİF AYARLAR",
  },
  {
    title: "Vitrin & Anasayfa Ürün Sıralaması",
    text: "Ana sayfada hangi ürünün ilk kutuda, hangisinin 2. veya 3. sırada çıkacağını belirleyin.",
    href: "/admin/urunler/vitrin",
    badge: "VİTRİN SIRALAMASI",
  },
  {
    title: "Katalog & Vitrin Ürünleri",
    text: "Ana sayfada öne çıkan ürünleri seçin, ürün açıklamalarını ve koku notalarını güncelleyin.",
    href: "/admin/urunler",
    badge: "ÜRÜNLER",
  },
  {
    title: "Kategori & Menü Sıralaması",
    text: "Header menüsündeki kategorileri düzenleyin, sıralamayı ve linkleri belirleyin.",
    href: "/admin/kategoriler",
    badge: "KATEGORİLER",
  },
  {
    title: "SEO & Sosyal Paylaşım Görselleri",
    text: "Google arama başlıkları, meta açıklamaları ve analitik izleme kodları.",
    href: "/admin/seo",
    badge: "SEO & ANALİTİK",
  },
];

export default async function DesignAdmin() {
  await requireAdmin();

  return (
    <main className="admin-shell">
      <section className="admin-main">
        <p className="admin-kicker">YÖNETİM PANELİ / 03</p>
        <h1>Web Tasarımı & Görünüm</h1>
        <p className="admin-lead">
          Markanın vitrini olan görsel ve içerik ayarlarını doğrudan ilgili yönetim alanlarından yönetin.
        </p>

        <div className="admin-section-grid">
          {designSections.map((sec) => (
            <Link href={sec.href} className="admin-section-card" key={sec.title}>
              <span>{sec.badge}</span>
              <h2>{sec.title}</h2>
              <p>{sec.text}</p>
              <b>Bölümü Yönet →</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}