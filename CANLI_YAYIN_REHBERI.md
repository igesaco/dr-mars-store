# Dr. Mars — Canlı Dağıtım (Vercel & Hostinger) ve Veritabanı Kurulum Notları

Bu rehber, sitede karşılaşılan **`Minified React error #441` (Bir Şeyler Ters Gitti)** ve **`400 Bad Request (image)`** hatalarının çözümü için hazırlanmıştır.

---

## 1. Ne Düzeltildi?
- **Görsel 400 Hatası Çözüldü:** `next.config.ts` dosyasına `images: { unoptimized: true }` ayarı eklendi ve commit edildi. Canlıdaki Base64 ve harici ürün fotoğrafları artık 400 hatası vermeyecek.

---

## 2. Karşılaşılan "Bir Şeyler Ters Gitti" Hatasının Nedeni
- Bilgisayarınızdaki yerel PostgreSQL (`127.0.0.1:5432`) sadece bilgisayarınız açıkken ve yerel ağınızda çalışır.
- Vercel veya Hostinger gibi bulut sunucuları, internet üzerinden sizin bilgisayarınızın içine (`127.0.0.1`) erişemez.
- `.env.local` dosyası güvenlik gereği GitHub'a yüklenmez. Canlı sunucuda `DATABASE_URL` bulunamadığı veya `localhost` kaldığı için veritabanı sorguları başarısız olmakta ve tüm sayfalar çökmektedir.

---

## 3. Döndüğünüzde Yapacağımız Adımlar (3 Adımda Çözüm)

### 1. Adım: Ücretsiz Bulut PostgreSQL Açma (2 Dakika)
Canlı sitenin 7/24 çalışabilmesi için veritabanının bulutta olması gerekir.
- **Seçenek A (En Kolay & Ücretsiz):** [neon.tech](https://neon.tech) sitesine gidin, GitHub veya Google ile giriş yapın.
  - "New Project" deyin (Proje adı: `dr-mars-db`).
  - Size verilen `Connection String` dizesini kopyalayın. Şuna benzer:
    ```text
    postgresql://dr_mars_owner:sifreniz@ep-xyz.eu-central-1.aws.neon.tech/dr_mars?sslmode=require
    ```
- **Seçenek B (Alternatif):** Hostinger üzerinde bir VPS / uzaktan erişilebilir PostgreSQL veritabanınız varsa onun bağlantı dizesi.

---

### 2. Adım: Vercel Ortam Değişkenlerini (Environment Variables) Ekleme
1. [vercel.com](https://vercel.com) Dashboard'unuza girin.
2. `dr-mars-store` projenizi seçin.
3. **Settings > Environment Variables** bölümüne gidin.
4. Aşağıdaki 3 değişkeni ekleyin:
   - `DATABASE_URL`: `postgresql://...` (Neon veya Hostinger'dan aldığınız canlı adres)
   - `ADMIN_PASSWORD`: `15681568` (veya belirlediğiniz yönetici şifresi)
   - `ADMIN_SESSION_SECRET`: `serhatbilgiciwebsifresigirisicin` (veya 32+ haneli rastgele gizli anahtar)
5. **Deployments** sekmesinden projenin en üstündeki üç noktaya tıklayıp **Redeploy** deyin.

---

### 3. Adım: Tabloları Bulut Veritabanına Yükleme (Migration)
Kendi bilgisayarınızda:
1. `.env.local` dosyasını açıp `DATABASE_URL` kısmına yeni bulut adresinizi yapıştırın.
2. Terminalden tabloları aktarın:
   ```bash
   npm run db:migrate
   ```
3. GitHub'a son görsel düzeltmesini push edin:
   ```bash
   git push origin main
   ```
