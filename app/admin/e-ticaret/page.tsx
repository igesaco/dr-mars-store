import Link from "next/link";

const liveSections = [
  {
    title: "Ürün & Stok Yönetimi",
    text: "Ürün ekle, fiyat ve stok düzenle, varyantları ve ürün görsellerini yönet.",
    href: "/admin/urunler",
    badge: "CANLI · POSTGRESQL",
  },
  {
    title: "Sipariş & Kargo Operasyonu",
    text: "Gelen siparişleri listele, kargo takip numarası gir, durumları (hazırlanıyor, kargoda vb.) güncelle.",
    href: "/admin/siparisler",
    badge: "CANLI · SİPARİŞ MOTORU",
  },
  {
    title: "Kuponlar & Promosyon",
    text: "Yüzdelik veya sabit TL indirim kuponları oluştur, kullanım limitlerini belirle.",
    href: "/admin/kuponlar",
    badge: "CANLI · KUPON",
  },
  {
    title: "Müşteri Yönetimi",
    text: "Kayıtlı müşterilerin hesaplarını, harcama özetlerini ve durumlarını incele.",
    href: "/admin/musteriler",
    badge: "CANLI · MÜŞTERİLER",
  },
  {
    title: "Mağaza & Kargo Ayarları",
    text: "Üst duyuru bandı, ücretsiz kargo limiti, iletişim bilgileri ve sosyal medya linkleri.",
    href: "/admin/ayarlar",
    badge: "CANLI · AYARLAR",
  },
];

export default function CommerceAdmin() {
  return (
    <main className="admin-shell">
      <section className="admin-main">
        <p className="admin-kicker">YÖNETİM PANELİ / 01</p>
        <h1>E-Ticaret & Mağaza Operasyonları</h1>
        <p className="admin-lead">
          Ürünlerden siparişlere, kuponlardan kargo ve mağaza ayarlarına kadar tüm e-ticaret süreçlerini buradan yönetin.
        </p>

        <div className="admin-section-grid">
          {liveSections.map((sec) => (
            <Link href={sec.href} className="admin-section-card" key={sec.title}>
              <span>{sec.badge}</span>
              <h2>{sec.title}</h2>
              <p>{sec.text}</p>
              <b>Bölümü aç →</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
