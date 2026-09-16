import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL eksik.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function seed() {
  console.log("🌱 Dr. Mars tohumlama başlatılıyor...");

  // 1. Kategoriler
  const categoriesData = [
    {
      name: "Kolonyalar",
      slug: "kolonyalar",
      description: "Gün boyu ferahlık sunan imza kolonya koleksiyonu.",
      sortOrder: 1,
      isActive: true,
      seoTitle: "Dr. Mars Kolonya Koleksiyonu | Modern Ferahlık",
      seoDescription: "Yüksek kalıcılık ve modern koku notalarıyla formüle edilen Dr. Mars kolonya serisi.",
    },
    {
      name: "Özel Seri",
      slug: "ozel-seri",
      description: "Nadir esanslar ve derin odunsu notalarla harmanlanmış özel seçki.",
      sortOrder: 2,
      isActive: true,
      seoTitle: "Dr. Mars Özel Seri Parfümlü Kolonyalar",
      seoDescription: "Sınırlı sayıda üretilen amber ve baharat esintili özel koleksiyon.",
    },
    {
      name: "Hediye Setleri",
      slug: "hediye-setleri",
      description: "Şık tasarım kutularında sevdiklerinize unutulmaz bir ferahlık hediyesi.",
      sortOrder: 3,
      isActive: true,
      seoTitle: "Dr. Mars Premium Hediye Setleri",
      seoDescription: "Farklı boy ve koku seçenekleriyle hazırlanan hediye paketleri.",
    },
  ];

  const catMap = new Map();
  for (const cat of categoriesData) {
    const [row] = await sql`
      insert into categories (name, slug, description, sort_order, is_active, seo_title, seo_description)
      values (${cat.name}, ${cat.slug}, ${cat.description}, ${cat.sortOrder}, ${cat.isActive}, ${cat.seoTitle}, ${cat.seoDescription})
      on conflict (slug) do update set
        name = excluded.name,
        description = excluded.description,
        sort_order = excluded.sort_order,
        is_active = excluded.is_active
      returning id, slug
    `;
    catMap.set(row.slug, row.id);
  }
  console.log("✓ Kategoriler oluşturuldu / güncellendi.");

  // 2. Ürünler
  const kolonyaCatId = catMap.get("kolonyalar");
  const ozelSeriCatId = catMap.get("ozel-seri");

  const productsData = [
    {
      name: "Citrus No. 01",
      slug: "citrus-no-01",
      categoryId: kolonyaCatId,
      shortDescription: "Bergamot, beyaz çay ve temiz misk notalarıyla gün boyu ferah bir iz.",
      description: "Akdeniz narenciyelerinin canlandırıcı enerjisiyle açılan Citrus No. 01, orta notalarda berrak beyaz çay yapraklarıyla dinginleşir. Dip notalardaki yumuşak misk ve amber dokunuşu, geleneksel kolonya ferahlığını gün boyu süren zarif bir koku imzasına dönüştürür. 80 derece özel alkol bazıyla hijyenik ve canlandırıcı bir bakım sunar.",
      fragranceNotes: ["Bergamot", "Beyaz Çay", "Limon Çiçeği", "Temiz Misk"],
      isFeatured: true,
      isActive: true,
      seoTitle: "Citrus No. 01 Kolonya | Dr. Mars",
      seoDescription: "Bergamot ve beyaz çay esintili modern kolonya. Uzun süre kalıcı ve ferahlatıcı.",
      imageUrl: "/images/dr-mars-hero.png",
      variants: [
        { name: "100 ML", sku: "DRM-CT-100", volumeMl: 100, price: "349.00", compareAtPrice: "399.00", unitCost: "90.00", stock: 65, threshold: 10 },
        { name: "250 ML", sku: "DRM-CT-250", volumeMl: 250, price: "549.00", compareAtPrice: "649.00", unitCost: "140.00", stock: 40, threshold: 8 },
        { name: "400 ML", sku: "DRM-CT-400", volumeMl: 400, price: "749.00", compareAtPrice: "899.00", unitCost: "190.00", stock: 25, threshold: 5 },
      ],
    },
    {
      name: "Mineral No. 02",
      slug: "mineral-no-02",
      categoryId: kolonyaCatId,
      shortDescription: "Adaçayı, deniz tuzu ve serin kıyı rüzgarlarıyla arındırıcı bir hafiflik.",
      description: "Mineral No. 02, dalgaların kayalara çarptığı kıyı sabahlarının tuzlu ve temiz havasını teninize taşır. Aromatik yabani adaçayı ve mineral akorları, dipte odunsu sedir yapraklarıyla dengelenir. Zihni tazeleyen, modern ve maskülen/unisex dengesi kusursuz bir koku yolculuğu.",
      fragranceNotes: ["Adaçayı", "Deniz Tuzu", "Mersin Yaprağı", "Sedir Ağacı"],
      isFeatured: true,
      isActive: true,
      seoTitle: "Mineral No. 02 Kolonya | Dr. Mars",
      seoDescription: "Deniz tuzu ve adaçayı notalarıyla ferahlatıcı aromatik kolonya.",
      imageUrl: "/images/dr-mars-hero.png",
      variants: [
        { name: "100 ML", sku: "DRM-MN-100", volumeMl: 100, price: "349.00", compareAtPrice: "399.00", unitCost: "90.00", stock: 50, threshold: 10 },
        { name: "250 ML", sku: "DRM-MN-250", volumeMl: 250, price: "549.00", compareAtPrice: "649.00", unitCost: "140.00", stock: 35, threshold: 8 },
      ],
    },
    {
      name: "Night No. 03",
      slug: "night-no-03",
      categoryId: ozelSeriCatId,
      shortDescription: "Kakule, sedir ağacı ve dumanlı amber dokunuşuyla etkileyici ve karizmatik.",
      description: "Günün yorgunluğunu unutturan, akşamın gizemli aurasına eşlik eden derin bir imza. Kakulenin baharatlı sıcaklığı, kuru sedir ağacı ve tabanda zengin kehribar (amber) notalarıyla birleşir. Klasik kolonyaların ötesinde, niş bir parfüm derinliğinde deneyim arayanlar için tasarlandı.",
      fragranceNotes: ["Kakule", "Pembe Biber", "Sedir Ağacı", "Sıcak Amber"],
      isFeatured: true,
      isActive: true,
      seoTitle: "Night No. 03 Özel Seri Kolonya | Dr. Mars",
      seoDescription: "Kakule ve sedir ağacı notalarıyla zenginleşen karizmatik gece kolonyası.",
      imageUrl: "/images/dr-mars-hero.png",
      variants: [
        { name: "100 ML", sku: "DRM-NT-100", volumeMl: 100, price: "399.00", compareAtPrice: "459.00", unitCost: "110.00", stock: 45, threshold: 10 },
        { name: "250 ML", sku: "DRM-NT-250", volumeMl: 250, price: "599.00", compareAtPrice: "699.00", unitCost: "160.00", stock: 28, threshold: 8 },
        { name: "400 ML", sku: "DRM-NT-400", volumeMl: 400, price: "799.00", compareAtPrice: "949.00", unitCost: "210.00", stock: 15, threshold: 5 },
      ],
    },
    {
      name: "Amber No. 04",
      slug: "amber-no-04",
      categoryId: ozelSeriCatId,
      shortDescription: "Sıcak vanilya, paçuli ve oryantal reçinelerle sarmalayıcı bir zarafet.",
      description: "Duyuları harekete geçiren Amber No. 04; teninizde eriyen kadifemsi vanilya, topraksı paçuli ve asil reçinelerin büyüleyici ahengidir. Her sıktığınızda konforlu, sıcak ve lüks bir his bırakır.",
      fragranceNotes: ["Oryantal Vanilya", "Altın Amber", "Paçuli", "Tütün Çiçeği"],
      isFeatured: true,
      isActive: true,
      seoTitle: "Amber No. 04 Kolonya | Dr. Mars",
      seoDescription: "Sıcak vanilya ve paçuli dokunuşlu lüks kolonya.",
      imageUrl: "/images/dr-mars-hero.png",
      variants: [
        { name: "100 ML", sku: "DRM-AM-100", volumeMl: 100, price: "399.00", compareAtPrice: "459.00", unitCost: "110.00", stock: 35, threshold: 10 },
        { name: "250 ML", sku: "DRM-AM-250", volumeMl: 250, price: "599.00", compareAtPrice: "699.00", unitCost: "160.00", stock: 20, threshold: 6 },
      ],
    },
  ];

  for (const prod of productsData) {
    const [productRow] = await sql`
      insert into products (name, slug, category_id, short_description, description, fragrance_notes, is_featured, is_active, seo_title, seo_description)
      values (
        ${prod.name},
        ${prod.slug},
        ${prod.categoryId},
        ${prod.shortDescription},
        ${prod.description},
        ${JSON.stringify(prod.fragranceNotes)},
        ${prod.isFeatured},
        ${prod.isActive},
        ${prod.seoTitle},
        ${prod.seoDescription}
      )
      on conflict (slug) do update set
        name = excluded.name,
        category_id = excluded.category_id,
        short_description = excluded.short_description,
        description = excluded.description,
        fragrance_notes = excluded.fragrance_notes,
        is_featured = excluded.is_featured,
        is_active = excluded.is_active
      returning id
    `;

    // Resim ekle
    await sql`delete from product_images where product_id = ${productRow.id}`;
    await sql`
      insert into product_images (product_id, url, alt_text, sort_order)
      values (${productRow.id}, ${prod.imageUrl}, ${prod.name}, 0)
    `;

    // Varyantlar
    for (const v of prod.variants) {
      const [variantRow] = await sql`
        insert into product_variants (product_id, name, sku, volume_ml, price, compare_at_price, unit_cost, stock_quantity, low_stock_threshold, is_active)
        values (
          ${productRow.id},
          ${v.name},
          ${v.sku},
          ${v.volumeMl},
          ${v.price},
          ${v.compareAtPrice},
          ${v.unitCost},
          ${v.stock},
          ${v.threshold},
          true
        )
        on conflict (sku) do update set
          name = excluded.name,
          volume_ml = excluded.volume_ml,
          price = excluded.price,
          compare_at_price = excluded.compare_at_price,
          unit_cost = excluded.unit_cost,
          stock_quantity = excluded.stock_quantity,
          low_stock_threshold = excluded.low_stock_threshold,
          is_active = excluded.is_active
        returning id
      `;

      // Başlangıç stok kaydı
      await sql`
        insert into inventory_movements (variant_id, type, quantity, note)
        values (${variantRow.id}, 'in', ${v.stock}, 'Tohumlama başlangıç stoğu')
      `;
    }
  }
  console.log("✓ Ürünler, görseller ve varyantlar oluşturuldu.");

  // 3. Kuponlar
  const couponsData = [
    { code: "HOSGELDIN10", type: "percent", value: "10.00", min: "500.00", limit: 500 },
    { code: "DRMARS100", type: "fixed", value: "100.00", min: "800.00", limit: 200 },
  ];

  for (const c of couponsData) {
    await sql`
      insert into coupons (code, type, value, minimum_order_amount, usage_limit, is_active)
      values (${c.code}, ${c.type}, ${c.value}, ${c.min}, ${c.limit}, true)
      on conflict (code) do update set
        type = excluded.type,
        value = excluded.value,
        minimum_order_amount = excluded.minimum_order_amount,
        usage_limit = excluded.usage_limit,
        is_active = excluded.is_active
    `;
  }
  console.log("✓ İndirim kuponları tanımlandı.");

  // 4. Site Ayarları
  const settingsData = [
    {
      key: "announcement",
      value: { text: "1500 TL VE ÜZERİ SİPARİŞLERDE KARGO ÜCRETSİZ", active: true },
    },
    {
      key: "shipping",
      value: { freeThreshold: 1500, standardCost: 59, cargoCompany: "Yurtiçi Kargo" },
    },
    {
      key: "contact",
      value: {
        phone: "+90 (850) 300 00 00",
        email: "destek@drmars.com",
        address: "Teşvikiye Cad. No: 42/A Nişantaşı, Şişli, İstanbul",
        workingHours: "Hafta içi: 09:00 - 18:00",
      },
    },
    {
      key: "social",
      value: {
        instagram: "https://instagram.com/drmarscologne",
        facebook: "https://facebook.com/drmarscologne",
      },
    },
  ];

  for (const s of settingsData) {
    await sql`
      insert into site_settings (key, value)
      values (${s.key}, ${JSON.stringify(s.value)})
      on conflict (key) do update set
        value = excluded.value,
        updated_at = now()
    `;
  }
  console.log("✓ Site ayarları tanımlandı.");

  console.log("🎉 Tohumlama başarıyla tamamlandı!");
}

seed()
  .catch((err) => {
    console.error("Tohumlama hatası:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
