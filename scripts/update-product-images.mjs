import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

const updates = [
  { slug: "citrus-no-01", url: "/images/citrus-no-01.jpg" },
  { slug: "mineral-no-02", url: "/images/mineral-no-02.jpg" },
  { slug: "night-no-03", url: "/images/night-no-03.jpg" },
  { slug: "amber-no-04", url: "/images/amber-no-04.jpg" },
];

for (const u of updates) {
  const [prod] = await sql`select id from products where slug = ${u.slug}`;
  if (prod) {
    await sql`update product_images set url = ${u.url} where product_id = ${prod.id}`;
    console.log(`Updated image for ${u.slug} -> ${u.url}`);
  }
}

await sql.end();
