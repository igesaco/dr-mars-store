import Link from "next/link";

export type ProductFormData = {
  id?: string; variantId?: string; name?: string; slug?: string; shortDescription?: string | null;
  description?: string | null; fragranceNotes?: string[] | null; categoryId?: string | null; featured?: boolean; active?: boolean;
  sku?: string | null; volumeMl?: number | null; price?: string | null; compareAtPrice?: string | null;
  unitCost?: string | null; stock?: number | null; lowStockThreshold?: number | null; imageUrl?: string | null;
  seoTitle?: string | null; seoDescription?: string | null;
};

export default function ProductForm({ data = {}, categories, action, mode }: {
  data?: ProductFormData;
  categories: { id: string; name: string }[];
  action: (form: FormData) => Promise<void>;
  mode: "create" | "edit";
}) {
  return <form action={action} className="product-editor">
    {data.id && <input type="hidden" name="id" value={data.id} />}
    {data.variantId && <input type="hidden" name="variantId" value={data.variantId} />}
    <div className="product-editor-main">
      <section className="editor-card">
        <div className="editor-title"><span>01</span><div><h2>Temel bilgiler</h2><p>Müşterinin ürün sayfasında göreceği ana bilgiler.</p></div></div>
        <div className="editor-fields">
          <label className="editor-wide">Ürün adı<input name="name" required maxLength={180} defaultValue={data.name ?? ""} placeholder="Örn. Citrus No. 01" /></label>
          <label>URL kısa adı<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={data.slug ?? ""} placeholder="citrus-no-01" /></label>
          <label>Kategori<select name="categoryId" defaultValue={data.categoryId ?? ""}><option value="">Kategorisiz</option>{categories.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
          <label className="editor-wide">Koku notaları (Virgülle ayırarak yazın)<input name="fragranceNotes" defaultValue={Array.isArray(data.fragranceNotes) ? data.fragranceNotes.join(", ") : ""} placeholder="Örn. Bergamot, Beyaz Çay, Temiz Misk" /></label>
          <label className="editor-wide">Kısa açıklama<textarea name="shortDescription" maxLength={500} rows={3} defaultValue={data.shortDescription ?? ""} placeholder="Listeleme ve özet alanında gösterilecek kısa metin" /></label>
          <label className="editor-wide">Ürün açıklaması<textarea name="description" rows={7} defaultValue={data.description ?? ""} placeholder="Koku karakteri, kullanım şekli, içerik ve ürün detayları" /></label>
        </div>
      </section>
      <section className="editor-card">
        <div className="editor-title"><span>02</span><div><h2>Görsel</h2><p>Şimdilik güvenli bir görsel bağlantısı kullanılır.</p></div></div>
        <div className="editor-fields"><label className="editor-wide">Ana görsel URL<input name="imageUrl" type="url" defaultValue={data.imageUrl ?? ""} placeholder="https://.../urun-gorseli.jpg" /></label></div>
        {data.imageUrl && <div className="editor-image-preview"><img src={data.imageUrl} alt="" /></div>}
      </section>
      <section className="editor-card">
        <div className="editor-title"><span>03</span><div><h2>Fiyatlandırma</h2><p>Satış fiyatı, karşılaştırma fiyatı ve gerçek birim maliyet.</p></div></div>
        <div className="editor-fields">
          <label>Satış fiyatı (₺)<input name="price" type="number" min="0" step="0.01" required defaultValue={data.price ?? ""} /></label>
          <label>Eski / karşılaştırma fiyatı (₺)<input name="compareAtPrice" type="number" min="0" step="0.01" defaultValue={data.compareAtPrice ?? ""} /></label>
          <label>Birim maliyet (₺)<input name="unitCost" type="number" min="0" step="0.01" defaultValue={data.unitCost ?? ""} placeholder="Kâr raporu için" /></label>
        </div>
      </section>
      <section className="editor-card">
        <div className="editor-title"><span>04</span><div><h2>Envanter</h2><p>SKU, hacim ve stok uyarı seviyeleri.</p></div></div>
        <div className="editor-fields">
          <label>SKU<input name="sku" required pattern="[A-Za-z0-9-]{3,100}" defaultValue={data.sku ?? ""} placeholder="DRM-CT-100" /></label>
          <label>Hacim (ML)<input name="volumeMl" type="number" min="1" required defaultValue={data.volumeMl ?? 100} /></label>
          <label>Mevcut stok<input name="stock" type="number" min="0" step="1" required defaultValue={data.stock ?? 0} /></label>
          <label>Düşük stok uyarısı<input name="lowStockThreshold" type="number" min="0" step="1" required defaultValue={data.lowStockThreshold ?? 5} /></label>
        </div>
      </section>
      <section className="editor-card">
        <div className="editor-title"><span>05</span><div><h2>Arama motoru görünümü</h2><p>Google ve sosyal paylaşım başlıklarını düzenle.</p></div></div>
        <div className="editor-fields">
          <label className="editor-wide">SEO başlığı<input name="seoTitle" maxLength={160} defaultValue={data.seoTitle ?? ""} /></label>
          <label className="editor-wide">SEO açıklaması<textarea name="seoDescription" maxLength={320} rows={3} defaultValue={data.seoDescription ?? ""} /></label>
        </div>
      </section>
    </div>
    <aside className="product-editor-aside">
      <section className="editor-card">
        <h2>Yayın durumu</h2>
        <label className="editor-status"><input type="radio" name="status" value="active" defaultChecked={data.active !== false} /><span><b>Yayında</b><small>Mağazada satışa açık</small></span></label>
        <label className="editor-status"><input type="radio" name="status" value="draft" defaultChecked={data.active === false} /><span><b>Taslak</b><small>Mağazada gösterilmez</small></span></label>
        <label className="editor-featured"><input type="checkbox" name="isFeatured" defaultChecked={data.featured} /> Öne çıkan ürün</label>
      </section>
      <section className="editor-card editor-summary">
        <span>{mode === "create" ? "YENİ ÜRÜN" : "ÜRÜN DÜZENLEME"}</span>
        <p>Zorunlu alanlar doldurulduğunda ürün ve ilk varyant tek işlemde kaydedilir.</p>
        <button type="submit">{mode === "create" ? "Ürünü kaydet" : "Değişiklikleri kaydet"}</button>
        <Link href="/admin/urunler">İptal et ve ürünlere dön</Link>
      </section>
    </aside>
  </form>;
}
