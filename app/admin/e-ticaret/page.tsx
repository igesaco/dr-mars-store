import Link from "next/link";

const sections = [
  ["Sipariş operasyonu", "Siparişler, iade, iptal, kargo, fatura ve teslimat"],
  ["Ödeme yönetimi", "Ödeme kuruluşları, tahsilat, iadeler ve ödeme raporları"],
  ["Müşteri & kampanya", "Müşteriler, kuponlar, indirimler ve segmentler"],
];

export default function CommerceAdmin() {
  return <main className="admin-shell"><section className="admin-main"><p className="admin-kicker">YÖNETİM PANELİ / 01</p><h1>E-ticaret & ödeme</h1><p className="admin-lead">Ürün yönetimi canlı; diğer satış işlemleri henüz geliştirme aşamasında.</p><div className="admin-section-grid"><Link href="/admin/urunler" className="admin-section-card"><span>CANLI · POSTGRESQL</span><h2>Ürün ve stok yönetimi</h2><p>Ürün ekle, fiyat ve stok düzenle, ürünleri arşivle. Değişiklikler veritabanına kaydedilir.</p><b>Ürün yönetimini aç →</b></Link>{sections.map(([title, text]) => <article className="admin-section-card" key={title}><span>YAKINDA</span><h2>{title}</h2><p>{text}</p><b>Henüz kullanıma açık değil</b></article>)}</div></section></main>;
}
