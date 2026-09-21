"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  Calculator,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  Layers,
  Link2,
  Megaphone,
  Percent,
  RefreshCw,
  Save,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AdIntegrationsConfig, saveAdIntegrationsAction } from "./actions";

export default function AdsManagerClient({
  initialConfig,
  baseUrl,
}: {
  initialConfig: AdIntegrationsConfig;
  baseUrl: string;
}) {
  const [config, setConfig] = useState<AdIntegrationsConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ROAS & Performance Simulator state
  const [adSpend, setAdSpend] = useState<number>(15000);
  const [targetRoas, setTargetRoas] = useState<number>(4.8);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(1250);

  // UTM Generator state
  const [utmPath, setUtmPath] = useState<string>("/kategori/kolonyalar");
  const [utmSource, setUtmSource] = useState<string>("instagram");
  const [utmMedium, setUtmMedium] = useState<string>("reels");
  const [utmCampaign, setUtmCampaign] = useState<string>("akik_serisi_lansman");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Bağlantı panoya kopyalandı!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await saveAdIntegrationsAction(formData);
      toast.success("Reklam entegrasyon ayarları başarıyla kaydedildi!");
    } catch (err: any) {
      toast.error(err?.message || "Ayarlar kaydedilirken hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  // ROAS Calculations
  const estimatedRevenue = adSpend * targetRoas;
  const estimatedOrders = Math.round(estimatedRevenue / avgOrderValue);
  const estimatedCostPerAcquisition = estimatedOrders > 0 ? Math.round(adSpend / estimatedOrders) : 0;
  const estimatedGrossProfit = estimatedRevenue * 0.65 - adSpend; // Assuming ~65% product gross margin

  // UTM URL
  const cleanBase = baseUrl.replace(/\/$/, "");
  const generatedUtmUrl = `${cleanBase}${utmPath.startsWith("/") ? utmPath : `/${utmPath}`}?utm_source=${encodeURIComponent(
    utmSource
  )}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* 1. ÜST ÖZET KARTI & BAĞLANTI DURUMU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Meta Ads Status Card */}
        <div className="admin-section-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Share2 size={14} /> Meta Ads (Instagram/FB)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                config.meta.enabled && config.meta.pixelId
                  ? "bg-green-100 text-green-800"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {config.meta.enabled && config.meta.pixelId ? "Aktif & İzliyor" : "Pasif / Yapılandırılmadı"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-2">
            {config.meta.pixelId ? `Piksel: ${config.meta.pixelId}` : "Piksel Eklenmedi"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Instagram Reels, Story ve Facebook dinamik ürün reklamları için piksel ve CAPI bağlantısı.
          </p>
        </div>

        {/* Google Ads Status Card */}
        <div className="admin-section-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-red-700 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Target size={14} /> Google Ads & Shopping
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                config.google.enabled && config.google.conversionId
                  ? "bg-green-100 text-green-800"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {config.google.enabled && config.google.conversionId
                ? "Aktif & İzliyor"
                : "Pasif / Yapılandırılmadı"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-2">
            {config.google.conversionId ? `Etiket: ${config.google.conversionId}` : "Tag Eklenmedi"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Google Arama, Alışveriş ve Performance Max kampanyaları için dönüşüm izleme.
          </p>
        </div>

        {/* TikTok Ads Status Card */}
        <div className="admin-section-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-stone-900 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Smartphone size={14} /> TikTok Ads
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                config.tiktok.enabled && config.tiktok.pixelId
                  ? "bg-green-100 text-green-800"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {config.tiktok.enabled && config.tiktok.pixelId ? "Aktif & İzliyor" : "Pasif / Yapılandırılmadı"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-2">
            {config.tiktok.pixelId ? `Piksel: ${config.tiktok.pixelId}` : "Piksel Eklenmedi"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            TikTok video akışı ve Spark reklamları için tam entegre e-ticaret dönüşüm takibi.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* 2. META ADS (FACEBOOK & INSTAGRAM) YAPILANDIRMASI */}
        <section className="editor-card space-y-6">
          <div className="flex items-start justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Share2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 m-0">
                  Meta Ads (Facebook & Instagram) Entegrasyonu
                </h2>
                <p className="text-xs text-stone-500 m-0">
                  Meta Business Suite, Instagram Reels & Hikaye reklamları ve Dinamik Ürün Yeniden Hedefleme.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                name="meta_enabled"
                defaultChecked={config.meta.enabled}
                className="w-4 h-4 accent-[#759531]"
              />
              <span>Meta Takibi Aktif</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Meta Pixel ID (Piksel Kimliği)
              </label>
              <input
                name="meta_pixel_id"
                defaultValue={config.meta.pixelId}
                placeholder="Örn: 987654321012345"
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
              <span className="block text-[11px] text-stone-500 mt-1">
                Meta Olay Yöneticisi (Events Manager) ekranından aldığınız 15-16 haneli piksel numarası.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Test Olay Kodu (Test Event Code - Opsiyonel)
              </label>
              <input
                name="meta_test_event_code"
                defaultValue={config.meta.testEventCode}
                placeholder="Örn: TEST12345"
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
              <span className="block text-[11px] text-stone-500 mt-1">
                Olay Yöneticisi &gt; Test Events sekmesindeki canlı test kodu (test bittiğinde boş bırakın).
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Conversions API (CAPI) Server-Side Access Token
              </label>
              <textarea
                name="meta_capi_token"
                rows={2}
                defaultValue={config.meta.capiToken}
                placeholder="EAAG... uzun erişim belirteci (Access Token)"
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900 font-mono"
              />
              <span className="block text-[11px] text-stone-500 mt-1">
                iOS 14.5+ Safari çerez engellerini aşarak satın alımları doğrudan sunucudan Meta&apos;ya iletir ve
                reklam ROAS&apos;ını %20-35 artırır.
              </span>
            </div>
          </div>
        </section>

        {/* 3. GOOGLE ADS & MERCHANT CENTER YAPILANDIRMASI */}
        <section className="editor-card space-y-6">
          <div className="flex items-start justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 m-0">
                  Google Ads & Google Alışveriş (Merchant Center)
                </h2>
                <p className="text-xs text-stone-500 m-0">
                  Google Arama, Alışveriş sekmesi, Performance Max ve YouTube dönüşüm izleme.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                name="google_enabled"
                defaultChecked={config.google.enabled}
                className="w-4 h-4 accent-[#759531]"
              />
              <span>Google Takibi Aktif</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Google Dönüşüm Kimliği (Conversion ID / Tag ID)
              </label>
              <input
                name="google_conversion_id"
                defaultValue={config.google.conversionId}
                placeholder="Örn: AW-123456789 veya G-XXXXXXXXXX"
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
              <span className="block text-[11px] text-stone-500 mt-1">
                Google Ads &gt; Araçlar &gt; Dönüşümler sayfasındaki AW- ile başlayan global site etiketi.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Satın Alma Dönüşüm Etiketi (Purchase Conversion Label)
              </label>
              <input
                name="google_purchase_label"
                defaultValue={config.google.purchaseLabel}
                placeholder="Örn: abc_CIXZ9e0DEI7x..."
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
              <span className="block text-[11px] text-stone-500 mt-1">
                Sipariş tamamlandığında gerçek cironun Google Ads&apos;e işlenmesini sağlayan benzersiz etiket.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  name="google_enhanced_conversions"
                  defaultChecked={config.google.enhancedConversions}
                  className="w-4 h-4 accent-[#759531]"
                />
                <div>
                  <strong className="block text-stone-900 text-xs">
                    Gelişmiş Dönüşümler (Enhanced Conversions) Desteği
                  </strong>
                  <span className="text-[11px] text-stone-500">
                    Müşterinin SHA-256 ile şifrelenmiş e-posta ve telefon bilgisini güvenli şekilde Google ile
                    eşleştirerek kayıp dönüşümleri kurtarır.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* 4. TIKTOK ADS YAPILANDIRMASI */}
        <section className="editor-card space-y-6">
          <div className="flex items-start justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold">
                <Smartphone size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 m-0">
                  TikTok For Business & TikTok Shop Entegrasyonu
                </h2>
                <p className="text-xs text-stone-500 m-0">
                  TikTok For You (FYP) akış reklamları, Spark Ads ve dönüşüm optimizasyonu.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
              <input
                type="checkbox"
                name="tiktok_enabled"
                defaultChecked={config.tiktok.enabled}
                className="w-4 h-4 accent-[#759531]"
              />
              <span>TikTok Takibi Aktif</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                TikTok Pixel ID
              </label>
              <input
                name="tiktok_pixel_id"
                defaultValue={config.tiktok.pixelId}
                placeholder="Örn: C123456789ABCDEF0"
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900"
              />
              <span className="block text-[11px] text-stone-500 mt-1">
                TikTok Ads Manager &gt; Assets &gt; Events bölümünden oluşturulan piksel kodu.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                TikTok Events API Access Token (Opsiyonel)
              </label>
              <input
                name="tiktok_events_api_token"
                defaultValue={config.tiktok.eventsApiToken}
                placeholder="TikTok sunucu taraflı token..."
                className="w-full rounded border border-stone-300 p-2.5 text-xs outline-none focus:border-stone-900 font-mono"
              />
              <span className="block text-[11px] text-stone-500 mt-1">
                TikTok Events API ile sunucu tarafı veri aktarımı.
              </span>
            </div>
          </div>
        </section>

        {/* KAYDET BUTONU */}
        <div className="flex items-center justify-end gap-3 sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-stone-200 shadow-xl">
          <Link href="/admin" className="text-xs text-stone-600 hover:text-stone-900 px-4 py-2">
            İptal
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#112334] text-white text-xs font-bold hover:bg-[#1a334c] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            <span>{isSaving ? "Kaydediliyor..." : "Reklam Entegrasyonlarını Kaydet"}</span>
          </button>
        </div>
      </form>

      {/* 5. DİNAMİK ÜRÜN KATALOG FEED BAĞLANTILARI */}
      <section className="editor-card space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 m-0">
              Otomatik Dinamik Ürün Katalog Feedleri (XML & JSON)
            </h2>
            <p className="text-xs text-stone-500 m-0">
              Bu bağlantıları Meta Commerce Manager, Google Merchant Center ve TikTok Katalog ayarlarınıza ekleyin.
              Ürünleriniz, fiyatlarınız ve stoklarınız otomatik olarak reklamlara akar.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Google Merchant Feed */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">Google Merchant Center Feed (XML)</span>
                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                  Google Shopping Standardı
                </span>
              </div>
              <code className="text-xs text-stone-600 font-mono mt-1 block break-all">
                {`${cleanBase}/api/catalog/feed?channel=google`}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(`${cleanBase}/api/catalog/feed?channel=google`, "google")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                {copiedKey === "google" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                <span>{copiedKey === "google" ? "Kopyalandı" : "Kopyala"}</span>
              </button>
              <a
                href="/api/catalog/feed?channel=google"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-stone-500 hover:text-stone-900"
                title="Yeni sekmede aç"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Meta Catalog Feed */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">Meta Commerce / Instagram Mağaza Feed (XML)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Meta Catalog Manager
                </span>
              </div>
              <code className="text-xs text-stone-600 font-mono mt-1 block break-all">
                {`${cleanBase}/api/catalog/feed?channel=meta`}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(`${cleanBase}/api/catalog/feed?channel=meta`, "meta")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                {copiedKey === "meta" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                <span>{copiedKey === "meta" ? "Kopyalandı" : "Kopyala"}</span>
              </button>
              <a
                href="/api/catalog/feed?channel=meta"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-stone-500 hover:text-stone-900"
                title="Yeni sekmede aç"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* TikTok Catalog JSON Feed */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">TikTok Shop & Catalog Feed (JSON)</span>
                <span className="text-[10px] bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded-full">
                  TikTok Product API
                </span>
              </div>
              <code className="text-xs text-stone-600 font-mono mt-1 block break-all">
                {`${cleanBase}/api/catalog/feed?channel=tiktok&format=json`}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(`${cleanBase}/api/catalog/feed?channel=tiktok&format=json`, "tiktok")
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                {copiedKey === "tiktok" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                <span>{copiedKey === "tiktok" ? "Kopyalandı" : "Kopyala"}</span>
              </button>
              <a
                href="/api/catalog/feed?channel=tiktok&format=json"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-stone-500 hover:text-stone-900"
                title="Yeni sekmede aç"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CANLI ROAS & REKLAM PERFORMANS SİMÜLATÖRÜ */}
      <section className="profit-sim-container">
        <div className="profit-sim-head">
          <div className="profit-sim-title">
            <Calculator size={18} />
            <span>Canlı ROAS & Reklam Performans Simülatörü</span>
          </div>
          <div className="profit-status-pill excellent">
            <TrendingUp size={13} />
            <span>Optimum Bütçe Hedefleme</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Aylık Reklam Bütçesi (₺)
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              value={adSpend}
              onChange={(e) => setAdSpend(Number(e.target.value))}
              className="w-full rounded border border-stone-300 p-2 text-xs bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Hedef ROAS Çarpanı (x)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={targetRoas}
              onChange={(e) => setTargetRoas(Number(e.target.value))}
              className="w-full rounded border border-stone-300 p-2 text-xs bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Ortalama Sepet Tutarı (AOV - ₺)
            </label>
            <input
              type="number"
              min="100"
              step="50"
              value={avgOrderValue}
              onChange={(e) => setAvgOrderValue(Number(e.target.value))}
              className="w-full rounded border border-stone-300 p-2 text-xs bg-white"
            />
          </div>
        </div>

        <div className="profit-sim-grid">
          <div className="profit-sim-metric">
            <span>AYLIK REKLAM HARCAMASI</span>
            <strong>₺{adSpend.toLocaleString("tr-TR")}</strong>
            <small>Meta + Google + TikTok Toplamı</small>
          </div>
          <div className="profit-sim-metric highlight-profit">
            <span>HEDEFLENEN CİRO</span>
            <strong>₺{estimatedRevenue.toLocaleString("tr-TR")}</strong>
            <small>{targetRoas}x ROAS Getirisi</small>
          </div>
          <div className="profit-sim-metric">
            <span>TAHMİNİ SİPARİŞ SAYISI</span>
            <strong>~{estimatedOrders} Adet</strong>
            <small>Müşteri Edinme: ~₺{estimatedCostPerAcquisition} / sipariş</small>
          </div>
          <div className="profit-sim-metric highlight-profit">
            <span>TAHMİNİ BRÜT REKLAM KÂRI</span>
            <strong>₺{estimatedGrossProfit.toLocaleString("tr-TR")}</strong>
            <small>Ürün maliyeti ve reklam düşüldükten sonra</small>
          </div>
        </div>
      </section>

      {/* 7. AKILLI UTM KAMPANYA LİNK OLUŞTURUCU */}
      <section className="editor-card space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Link2 size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 m-0">
              Akıllı UTM Kampanya Link Oluşturucu
            </h2>
            <p className="text-xs text-stone-500 m-0">
              Instagram Story, Reels, TikTok veya Google reklamlarınız için tek tıkla hatasız takip bağlantısı üretin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Hedef Sayfa</label>
            <input
              value={utmPath}
              onChange={(e) => setUtmPath(e.target.value)}
              placeholder="/kategori/kolonyalar"
              className="w-full rounded border border-stone-300 p-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Kaynak (utm_source)</label>
            <select
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              className="w-full rounded border border-stone-300 p-2 text-xs"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
              <option value="tiktok">TikTok</option>
              <option value="influencer">Influencer İş Birliği</option>
              <option value="email">E-posta Bülteni</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Tür / Alan (utm_medium)</label>
            <select
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              className="w-full rounded border border-stone-300 p-2 text-xs"
            >
              <option value="story">Story (Hikaye Reklamı)</option>
              <option value="reels">Reels / Video</option>
              <option value="carousel">Carousel (Kaydırmalı Görsel)</option>
              <option value="cpc">Google Arama (CPC)</option>
              <option value="shopping">Google Alışveriş</option>
              <option value="bio_link">Profil Linki (Bio)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Kampanya Adı</label>
            <input
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="akik_serisi_lansman"
              className="w-full rounded border border-stone-300 p-2 text-xs font-mono"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
              Oluşturulan İzlenebilir Reklam Bağlantısı
            </span>
            <code className="text-xs text-stone-800 font-mono break-all block">
              {generatedUtmUrl}
            </code>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(generatedUtmUrl, "utm")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            {copiedKey === "utm" ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedKey === "utm" ? "Kopyalandı!" : "Linki Kopyala"}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
