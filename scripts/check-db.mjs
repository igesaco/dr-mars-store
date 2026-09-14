import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
let database;
try {
  database = new URL(connectionString);
} catch {
  console.error("DATABASE_URL eksik veya geçersiz. .env.local dosyasını kontrol et.");
  process.exit(1);
}

if (database.pathname !== "/dr_mars") {
  console.error("Güvenlik kontrolü: yalnızca dr_mars veritabanına bağlanılabilir.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1, connect_timeout: 5 });
try {
  const [result] = await sql`select current_database() as database_name, to_regclass('public.products') as products_table`;
  if (result.database_name !== "dr_mars") throw { code: "WRONG_DATABASE" };
  console.log("PostgreSQL bağlantısı başarılı: dr_mars.");
  console.log(result.products_table ? "Ürün tabloları mevcut." : "Ürün tabloları henüz yok; migration gerekli.");
} catch (error) {
  const issues = {
    "28P01": "PostgreSQL parolası yanlış. .env.local içindeki DATABASE_URL bilgisini kontrol et.",
    "28000": "PostgreSQL kullanıcısına giriş izni verilmedi.",
    "3D000": "dr_mars veritabanı bulunamadı.",
    "ECONNREFUSED": "PostgreSQL 127.0.0.1:5432 üzerinde bağlantı kabul etmiyor. Servisi kontrol et.",
    "ENOTFOUND": "DATABASE_URL içindeki sunucu adresi çözümlenemedi.",
    "WRONG_DATABASE": "Bağlanılan veritabanı dr_mars değil; işlem durduruldu.",
  };
  console.error(issues[error?.code] ?? `PostgreSQL bağlantısı başarısız (kod: ${String(error?.code ?? "bilinmiyor")}).`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 1 });
}
