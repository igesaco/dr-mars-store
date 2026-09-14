import { ArrowUpRight, Menu, Search, ShoppingBag, Sparkles } from "lucide-react";

const products = [
  { name: "Citrus No. 01", note: "Bergamot · beyaz çay", price: "₺349", tone: "lime" },
  { name: "Mineral No. 02", note: "Adaçayı · deniz tuzu", price: "₺349", tone: "blue" },
  { name: "Night No. 03", note: "Kakule · sedir ağacı", price: "₺399", tone: "violet" },
];

export default function Home() {
 return <main>
  <div className="announcement">1500 TL ve üzeri siparişlerde kargo ücretsiz</div>
  <header className="site-header"><a className="brand" href="#top"><span>DR</span><i/><span>MARS</span></a><nav><a href="#koleksiyon">Çok Satanlar</a><a href="#koleksiyon">Kolonyalar</a><a href="#koleksiyon">100 ML</a><a href="#koleksiyon">250 ML</a><a href="#koleksiyon">400 ML</a><a href="#koleksiyon">Hediye Setleri</a><a href="/hakkimizda">Kurumsal</a><a href="#rituel">Sipariş Takip</a></nav><div className="header-actions"><button aria-label="Ara"><Search size={19}/></button><button aria-label="Çanta" className="bag"><ShoppingBag size={19}/><span>0</span></button><button className="menu" aria-label="Menü"><Menu size={22}/></button></div></header>
  <section className="hero" id="top"><img src="/images/dr-mars-hero.png" alt="Dr Mars premium kolonya koleksiyonu"/><div className="hero-shade"/><div className="hero-copy"><p className="eyebrow"><Sparkles size={14}/> YENİ SEZON · 2026</p><h1>Kokunun<br/><em>yeni hali.</em></h1><p className="hero-text">Köklü kolonya geleneğini modern notalar ve uzun süre kalan ferahlıkla yeniden yorumluyoruz.</p><a className="primary-link" href="#koleksiyon">Koleksiyonu keşfet <ArrowUpRight size={18}/></a></div></section>
  <section className="intro" id="hikaye"><p className="eyebrow dark">BİR İMZA GİBİ</p><h2>Her günün ritmine<br/>yakışan bir ferahlık.</h2><p>Günün ilk ışığından gecenin son planına kadar sana eşlik eden; temiz, karakterli ve hatırlanan bir koku.</p></section>
  <section className="collection" id="koleksiyon"><div className="section-heading"><div><p className="eyebrow dark">ÖNE ÇIKAN ÜRÜNLER</p><h2>Kolonyalar.</h2></div><a href="#koleksiyon">Tüm ürünler <ArrowUpRight size={17}/></a></div><div className="product-grid">{products.map((p,i)=><article className="product" key={p.name}><a className={`product-art ${p.tone}`} href="#koleksiyon"><span>0{i+1}</span><b>DR<br/>MARS</b></a><div className="product-details"><div><h3>{p.name}</h3><p>{p.note}</p></div><strong>{p.price}</strong></div></article>)}</div></section>
  <section className="ritual" id="rituel"><div className="ritual-copy"><p className="eyebrow">GÜNLÜK RİTÜEL</p><h2>Ferahlığını<br/>yanında taşı.</h2><p>Avuç içine birkaç damla. Boyun, bilekler ve günün geri kalanı sana ait.</p><a href="#koleksiyon" className="text-link">Koku ritüelini keşfet <ArrowUpRight size={17}/></a></div><div className="ritual-words"><span>CLEAN</span><span>VIVID</span><span>YOURS</span></div></section>
  <section className="newsletter"><p className="eyebrow">DR MARS NOTLARI</p><h2>İlk sen duy.</h2><p>Yeni kokular, sınırlı setler ve sadece üyelerimize özel fırsatlar.</p><form><label className="sr-only" htmlFor="email">E-posta</label><input id="email" type="email" placeholder="E-posta adresin"/><button>Katıl <ArrowUpRight size={17}/></button></form></section>
  <footer><a className="brand" href="#top"><span>DR</span><i/><span>MARS</span></a><span>© 2026 Dr Mars. Modern Cologne.</span><div><a href="#">Instagram</a><a href="#">İletişim</a></div></footer>
 </main>
}
