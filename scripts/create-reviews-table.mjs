import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

try {
  console.log("Checking and creating product_reviews table...");

  await sql`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      author_name VARCHAR(120) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(180),
      comment TEXT NOT NULL,
      is_approved BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("product_reviews table ready.");

  // Check if we have any reviews
  const existing = await sql`SELECT count(*) as count FROM product_reviews`;
  if (parseInt(existing[0].count, 10) === 0) {
    console.log("Seeding realistic starter reviews for products...");
    const prods = await sql`SELECT id, name, slug FROM products`;
    for (const prod of prods) {
      if (prod.slug === "citrus-no-01") {
        await sql`
          INSERT INTO product_reviews (product_id, author_name, rating, title, comment, is_approved)
          VALUES 
          (${prod.id}, 'Caner Y.', 5, 'Muhteşem Ferahlık', 'Narenciye ve bergamot dengesi harika. Gün boyu tenimde tertemiz bir tazelik hissi bırakıyor. Ofiste sürekli markasını soruyorlar.', true),
          (${prod.id}, 'Zeynep K.', 5, 'İmza Kokum Oldu', 'Cam şişe tasarımı çok lüks, kokunun kalıcılığı kolonya standartlarının çok ötesinde. Hediye paketi de çok özenliydi.', true),
          (${prod.id}, 'Mert D.', 4, 'Taze ve Kalıcı', 'Açılışı çok canlı limon ve portakal çiçeği, tabanındaki odunsu dokunuş harika oturuyor. Tavsiye ederim.', true)
        `;
      } else if (prod.slug === "mineral-no-02") {
        await sql`
          INSERT INTO product_reviews (product_id, author_name, rating, title, comment, is_approved)
          VALUES 
          (${prod.id}, 'Bora A.', 5, 'Deniz Esintisi ve Adaçayı', 'Tam bir Akdeniz ferahlığı. Ağırlaşmayan, modern ve sofistike bir dokusu var.', true),
          (${prod.id}, 'Elif S.', 5, 'Çok Şık Bir Koku', 'Erkek arkadaşıma hediye almıştım, bayıldık. 250ml olanı tekrar sipariş verdik.', true)
        `;
      } else if (prod.slug === "night-no-03") {
        await sql`
          INSERT INTO product_reviews (product_id, author_name, rating, title, comment, is_approved)
          VALUES 
          (${prod.id}, 'Serdar T.', 5, 'Akşamlar İçin Harika Bir Tercih', 'Sedir ağacı ve karabiber notaları müthiş derinlik katmış. Parfüm kalitesinde.', true)
        `;
      } else if (prod.slug === "amber-no-04") {
        await sql`
          INSERT INTO product_reviews (product_id, author_name, rating, title, comment, is_approved)
          VALUES 
          (${prod.id}, 'Ayşe N.', 5, 'Sıcak ve Asil', 'Kehribar ve vanilya notaları çok zarif işlenmiş. Kış ve sonbahar günlerinde vazgeçilmezim.', true)
        `;
      }
    }
    console.log("Starter reviews seeded successfully.");
  } else {
    console.log(`Existing reviews found: ${existing[0].count}`);
  }

} catch (err) {
  console.error("Migration error:", err);
  process.exit(1);
} finally {
  await sql.end();
}
