import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import { CologneHeroAnimation } from "@/components/storefront/cologne-hero-animation";
import { IntroCinematic } from "@/components/storefront/intro-cinematic";
import { getFeaturedProducts, getStoreNavCategories, getStoreSettings } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, products, settings] = await Promise.all([
    getStoreNavCategories(),
    getFeaturedProducts(),
    getStoreSettings(),
  ]);

  const announcement = settings.announcement?.text ?? "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ";

  return (
    <main className="min-h-screen bg-[#f5f4ee] text-[#0b1724]">
      {/* Cinematic Chemistry & Atom Cologne Genesis Animation */}
      <IntroCinematic />

      {/* Header */}
      <Header categories={categories} announcementText={announcement} />

      {/* Animated Luxury Cologne Hero */}
      <CologneHeroAnimation />

      {/* Intro Story */}
      <section className="intro" id="hikaye">
        <p className="eyebrow dark">BİR İMZA GİBİ</p>
        <h2>
          Her günün ritmine
          <br />
          yakışan bir ferahlık.
        </h2>
        <p>
          Günün ilk ışığından gecenin son planına kadar sana eşlik eden; temiz, karakterli ve hatırlanan bir koku.
        </p>
      </section>

      {/* Dynamic Collection */}
      <section className="collection" id="koleksiyon">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">ÖNE ÇIKAN KOLEKSİYON</p>
            <h2>Kolonyalar.</h2>
          </div>
          <Link href="/kategori/kolonyalar">
            Tüm ürünler <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              shortDescription={p.shortDescription}
              fragranceNotes={p.fragranceNotes}
              variants={p.variants}
              imageUrl={p.imageUrl}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Daily Ritual */}
      <section className="ritual" id="rituel">
        <div className="ritual-copy">
          <p className="eyebrow">GÜNLÜK RİTÜEL</p>
          <h2>
            Ferahlığını
            <br />
            yanında taşı.
          </h2>
          <p>Avuç içine birkaç damla. Boyun, bilekler ve günün geri kalanı sana ait.</p>
          <Link href="/kategori/kolonyalar" className="text-link">
            Koku ritüelini keşfet <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="ritual-words">
          <span>CLEAN</span>
          <span>VIVID</span>
          <span>YOURS</span>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
