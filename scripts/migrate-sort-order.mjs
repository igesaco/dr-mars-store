import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;`;
    console.log("SUCCESFULLY ADDED sort_order to products table!");

    // Kontrol et: Zeytin içeren veya zeytin benzeri bir ürün var mı?
    const products = await sql`SELECT id, name, slug, sort_order FROM products`;
    console.log("Mevcut ürünler:", products);

    // Eğer adında zeytin geçen varsa onun sort_order'ını 1 yapalım, diğerlerini 10, 20...
    for (const p of products) {
      if (p.name.toLowerCase().includes("zeytin") || p.slug.includes("zeytin")) {
        await sql`UPDATE products SET sort_order = 1 WHERE id = ${p.id}`;
        console.log(`"${p.name}" ürünü 1. sıraya alındı!`);
      }
    }
  } catch (e) {
    console.error("HATA:", e);
  } finally {
    await sql.end();
  }
}

run();
