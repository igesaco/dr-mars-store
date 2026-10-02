# DR. MARS — PROJE HAFIZASI & YÖNETİM REHBERİ (GEMINI / ANTIGRAVITY)

> **DİKKAT:** Bu dosya yapay zeka asistanı için kalıcı proje hafızasıdır. Yeni sohbetlerde veya bağlantı kesilmelerinde nerede kaldığımızı, sunucu bilgilerini ve şifreleri asla unutmamak için oluşturulmuştur.

---

## 1. Canlı Sunucu (Hostinger VPS) Bilgileri
- **Sunucu Sağlayıcı:** Hostinger VPS
- **Sunucu IP:** `179.198.218.196`
- **SSH / Tünel Kullanıcısı:** `root`
- **Sunucu Proje Dizin Yolu:** `/var/www/dr-mars`
- **Çalışma Yöneticisi:** PM2 (`dr-mars`, process id: `0`)
- **İç Port:** `5173` (Next.js start -p 5173)
- **GitHub Deposu:** `https://github.com/igesaco/dr-mars-store.git`
- **Aktif Dal (Branch):** `main`

---

## 2. Kimlik Bilgileri & Şifreler (Kalıcı Liste)

| Servis / Alan | Kullanıcı Adı / Değişken | Şifre | Açıklama |
| :--- | :--- | :--- | :--- |
| **Yönetim Paneli** | E-posta boş bırakılabilir (veya `1568serhat1568@gmail.com`) | **`15681568`** | `/yonetici-giris` adresinden ana yönetici girişi |
| **PostgreSQL (SQL)** | `postgres` | **`1568`** | Yerel ve VPS veritabanı şifresi |
| **pgAdmin 4** | `postgres` | **`1568`** | Veritabanı yönetim şifresi |
| **VPS Root (SSH)** | `root` | `15681568` | pgAdmin SSH tüneli ve sunucu girişi |
| **Oturum Anahtarı** | `ADMIN_SESSION_SECRET` | `serhatbilgiciwebsifresigirisicin` | Şifreli çerez imzalama anahtarı |

---

## 3. Ortam Değişkenleri (.env.local)

Hem yerel bilgisayarda hem de sunucudaki `/var/www/dr-mars/.env.local` içinde şu değerler tanımlıdır:

```env
DATABASE_URL=postgresql://postgres:1568@127.0.0.1:5432/dr_mars
ADMIN_PASSWORD=15681568
ADMIN_SESSION_SECRET=serhatbilgiciwebsifresigirisicin
```

---

## 4. Sunucu İşlem & Güncelleme Döngüsü

Sunucuda kod güncellendiğinde veya değişiklik yapıldığında çalıştırılacak standart sıra:

```bash
cd /var/www/dr-mars
git pull origin main
pnpm db:migrate
pnpm build
pm2 restart all
```

Logları ve hataları izlemek için:
```bash
pm2 logs dr-mars --lines 30
```

---

## 5. Proje Mimarisi & Önemli Dosyalar
- `app/yonetici-giris/`: Yönetim paneli giriş sayfası ve `loginAction`.
- `lib/admin-auth.ts`: Oturum doğrulama, `scrypt` şifreleme ve `15681568` master yetkilendirmesi.
- `drizzle/`: Veritabanı şema aktarımları (0000 - 0003). `product_reviews`, `admin_audit_logs`, `users`.
- `app/admin/`: Yönetim paneli (Ürünler, Siparişler, Kargo Etiketi, Loglar, Personel vb.).
