import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);
const images = await sql`select * from product_images`;
const prods = await sql`select id, name, slug from products`;
console.log({ images, prods });
await sql.end();
