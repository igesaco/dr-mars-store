import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL missing.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

try {
  console.log("Updating site_settings with authentic Dr. Mars Parfümeri data...");

  const contactData = {
    phone: "+90 (482) 212 19 03",
    whatsapp: "+90 (544) 212 19 03",
    email: "info@drmarsparfum.com",
    address: "Şar Mah. 1. Cadde No: 284, 47100 Artuklu / Mardin",
    factoryAddress: "Mardin Organize Sanayi Bölgesi (OSB) 2. Cadde No: 14, Artuklu / Mardin",
    workingHours: "Haftanın 7 Günü: 09:00 - 20:00",
    companyName: "Dr. Mars Kozmetik Kimya Sanayi ve Ticaret Ltd. Şti.",
    founder: "Kimya Mühendisi Hamdullah Adsoy",
    taxOffice: "Mardin Vergi Dairesi",
    taxNumber: "2340981249",
    mersisNo: "0234098124900001",
  };

  const socialData = {
    instagram: "https://www.instagram.com/dr.marsparfumeri/",
    facebook: "https://www.facebook.com/dr.marsparfumeri/",
  };

  await sql`
    UPDATE site_settings
    SET value = ${JSON.stringify(contactData)}::jsonb, updated_at = NOW()
    WHERE key = 'contact'
  `;

  await sql`
    UPDATE site_settings
    SET value = ${JSON.stringify(socialData)}::jsonb, updated_at = NOW()
    WHERE key = 'social'
  `;

  console.log("Site settings successfully updated with authentic Dr. Mars brand information.");
} catch (err) {
  console.error("Error updating company info:", err);
  process.exit(1);
} finally {
  await sql.end();
}
