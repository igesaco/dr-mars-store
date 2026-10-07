"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Truck,
  Gift,
  Package,
  TrendingUp,
  Tag,
  Info,
  Clock,
  Scale,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";

export type ProductFormData = {
  id?: string;
  variantId?: string;
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  fragranceNotes?: string[] | null;
  categoryId?: string | null;
  sortOrder?: number | null;
  featured?: boolean;
  active?: boolean;
  sku?: string | null;
  volumeMl?: number | null;
  price?: string | null;
  compareAtPrice?: string | null;
  unitCost?: string | null;
  stock?: number | null;
  lowStockThreshold?: number | null;
  imageUrl?: string | null;
  images?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  shippingPolicy?: string | null;
  carrierCost?: string | null;
  vatRate?: number | null;
  desi?: number | null;
  weightGrams?: number | null;
  deliveryTime?: string | null;
};

export default function ProductForm({
  data = {},
  categories,
  action,
  mode,
}: {
  data?: ProductFormData;
  categories: { id: string; name: string }[];
  action: (form: FormData) => Promise<void>;
  mode: "create" | "edit";
}) {
  // Financial & Logistics state for live calculation
  const [price, setPrice] = useState<string>(data.price ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState<string>(data.compareAtPrice ?? "");
  const [unitCost, setUnitCost] = useState<string>(data.unitCost ?? "");
  const [vatRate, setVatRate] = useState<number>(data.vatRate ?? 20);
  const [shippingPolicy, setShippingPolicy] = useState<"standard" | "free" | "paid">(
    (data.shippingPolicy as "standard" | "free" | "paid") || "standard"
  );
  const [carrierCost, setCarrierCost] = useState<string>(data.carrierCost ?? "65");
  const [desi, setDesi] = useState<string>(String(data.desi ?? "1"));
  const [weightGrams, setWeightGrams] = useState<string>(String(data.weightGrams ?? "450"));
  const [deliveryTime, setDeliveryTime] = useState<string>(data.deliveryTime ?? "same-day");
  const initialImages: string[] = Array.isArray(data.images) && data.images.length > 0
    ? data.images
    : (data.imageUrl ? [data.imageUrl] : []);
  const [imageList, setImageList] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

  const compressImage = (file: File): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            const rawUrl = e.target?.result as string;
            resolve({ blob: file, dataUrl: rawUrl });
            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          canvas.toBlob(
            (b) => {
              resolve({ blob: b || file, dataUrl });
            },
            "image/jpeg",
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");

    try {
      const uploadedUrls: string[] = [];
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        setUploadProgress(`${i + 1}/${total} görsel işleniyor...`);

        // 1. Tarayıcıda anında optimize et & sıkıştır
        const { blob, dataUrl } = await compressImage(file);

        // 2. Sunucuya da yüklemeyi dene
        let finalUrl = dataUrl;
        try {
          const fd = new FormData();
          fd.append("file", blob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: fd,
          });

          if (res.ok) {
            const result = (await res.json()) as { url?: string; error?: string };
            if (result.url) {
              finalUrl = result.url;
            }
          }
        } catch {
          // Sunucu yükleme hatası durumunda sıkıştırılmış dataUrl fallback
        }

        uploadedUrls.push(finalUrl);
      }

      if (uploadedUrls.length > 0) {
        setImageList((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err: any) {
      console.error("Görsel yükleme hatası:", err);
      setUploadError(err?.message || "Görseller yüklenirken bir sorun oluştu.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImageList((prev) => {
      const target = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [target, ...rest];
    });
  };

  const handleMoveImage = (fromIndex: number, direction: -1 | 1) => {
    const toIndex = fromIndex + direction;
    setImageList((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const handleAddPresetImage = (url: string) => {
    setImageList((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url];
    });
  };

  // Calculations
  const priceNum = parseFloat(price) || 0;
  const compareNum = parseFloat(compareAtPrice) || 0;
  const costNum = parseFloat(unitCost) || 0;
  const carrierNum = parseFloat(carrierCost) || 0;
  const vatNum = parseFloat(String(vatRate)) || 0;

  const discountPercent =
    compareNum > priceNum && priceNum > 0
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : 0;

  // Shelf price is VAT inclusive (KDV Dahil) in Turkish retail
  const netRevenue = priceNum > 0 ? priceNum / (1 + vatNum / 100) : 0;
  const vatAmount = priceNum > 0 ? priceNum - netRevenue : 0;

  // Shipping cost attribution to seller:
  // "free" -> Seller bears full carrier fee
  // "standard" -> If price >= 1500, free shipping qualifies (seller bears carrier fee).
  //               If price < 1500, customer pays 59 TL shipping, seller covers remaining difference if any.
  // "paid" -> Customer pays shipping, seller expense is 0 TL.
  let sellerShippingExpense = 0;
  let shippingCustomerExplanation = "";

  if (shippingPolicy === "free") {
    sellerShippingExpense = carrierNum;
    shippingCustomerExplanation = "Müşteriye Ücretsiz Kargo (Kargo bedeli satıcı tarafından karşılanır)";
  } else if (shippingPolicy === "standard") {
    if (priceNum >= 1500) {
      sellerShippingExpense = carrierNum;
      shippingCustomerExplanation = "Sepet 1.500 ₺ üstü kuralıyla Müşteriye Ücretsiz Kargo (Kargo satıcıda)";
    } else {
      sellerShippingExpense = Math.max(0, carrierNum - 59);
      shippingCustomerExplanation = `Müşteri 59 ₺ kargo öder (Satıcı anlaşma farkı: ${sellerShippingExpense.toFixed(2)} ₺)`;
    }
  } else {
    sellerShippingExpense = 0;
    shippingCustomerExplanation = "Kargo ücreti tamamen alıcı tarafından ödenir (Satıcıya maliyeti 0 ₺)";
  }

  const totalDirectCost = costNum + sellerShippingExpense;
  const netProfit = priceNum > 0 ? netRevenue - totalDirectCost : 0;
  const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

  const formatTL = (val: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  const getProfitStatus = () => {
    if (priceNum === 0) {
      return {
        pillClass: "neutral",
        label: "Fiyat Belirlenmedi",
        desc: "Satış fiyatı ve üretim maliyetini girerek net kâr simülasyonunu görün.",
      };
    }
    if (netProfit < 0) {
      return {
        pillClass: "danger",
        label: "Zararına Satış Uyarısı",
        desc: "Toplam üretim ve kargo maliyetiniz KDV hariç net hasılatınızı aşıyor!",
      };
    }
    if (profitMargin < 20) {
      return {
        pillClass: "warning",
        label: `Düşük Kâr Marjı (%${profitMargin.toFixed(1)})`,
        desc: "Pazarlama ve genel mağaza operasyon giderleri sonrası kârlılık daralabilir.",
      };
    }
    if (profitMargin < 50) {
      return {
        pillClass: "good",
        label: `Sağlıklı Kârlılık (%${profitMargin.toFixed(1)})`,
        desc: "E-ticaret ve perakende kozmetik için dengeli ve sürdürülebilir kâr marjı.",
      };
    }
    return {
      pillClass: "excellent",
      label: `Yüksek Lüks Marjı (%${profitMargin.toFixed(1)})`,
      desc: "Dr. Mars lüks niş parfüm ve kolonya segmenti için optimum kârlılık seviyesi.",
    };
  };

  const status = getProfitStatus();

  return (
    <form action={action} className="product-editor">
      {data.id && <input type="hidden" name="id" value={data.id} />}
      {data.variantId && <input type="hidden" name="variantId" value={data.variantId} />}

      {/* Additional logistics & tax metadata stored with form submit */}
      <input type="hidden" name="shippingPolicy" value={shippingPolicy} />
      <input type="hidden" name="carrierCost" value={carrierCost} />
      <input type="hidden" name="vatRate" value={vatRate} />
      <input type="hidden" name="desi" value={desi} />
      <input type="hidden" name="weightGrams" value={weightGrams} />
      <input type="hidden" name="deliveryTime" value={deliveryTime} />

      <div className="product-editor-main">
        {/* SECTION 01: TEMEL BİLGİLER */}
        <section className="editor-card">
          <div className="editor-title">
            <span>01</span>
            <div>
              <h2>Temel bilgiler</h2>
              <p>Müşterinin ürün sayfasında göreceği ana bilgiler ve koku kimliği.</p>
            </div>
          </div>
          <div className="editor-fields">
            <label className="editor-wide">
              Ürün adı
              <input
                name="name"
                required
                maxLength={180}
                defaultValue={data.name ?? ""}
                placeholder="Örn. Citrus No. 01 Kolonya"
              />
            </label>
            <label>
              URL kısa adı (Slug)
              <input
                name="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                defaultValue={data.slug ?? ""}
                placeholder="citrus-no-01"
              />
            </label>
            <label>
              Kategori
              <select name="categoryId" defaultValue={data.categoryId ?? ""}>
                <option value="">Kategorisiz</option>
                {categories.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="editor-wide">
              Koku notaları (Virgülle ayırarak yazın)
              <input
                name="fragranceNotes"
                defaultValue={
                  Array.isArray(data.fragranceNotes) ? data.fragranceNotes.join(", ") : ""
                }
                placeholder="Örn. Bergamot, Beyaz Çay, Temiz Misk, Akik Taşı Enerjisi"
              />
            </label>
            <label className="editor-wide">
              Kısa açıklama (Özet kart metni)
              <textarea
                name="shortDescription"
                maxLength={500}
                rows={3}
                defaultValue={data.shortDescription ?? ""}
                placeholder="Listeleme ve özet alanında gösterilecek etkileyici kısa metin"
              />
            </label>
            <label className="editor-wide">
              Detaylı ürün açıklaması
              <textarea
                name="description"
                rows={6}
                defaultValue={data.description ?? ""}
                placeholder="Koku karakteri, kullanım şekli, ritüeli, şişe tasarımı ve ürün detayları"
              />
            </label>
          </div>
        </section>

        {/* SECTION 02: GÖRSEL & ÇOKLU FOTOĞRAF GALERİSİ */}
        <section className="editor-card">
          <div className="editor-title">
            <span>02</span>
            <div>
              <h2>Ürün Fotoğrafları & Galeri</h2>
              <p>Her ürün için 2-3 veya daha fazla fotoğraf yükleyin. İlk sıradaki görsel vitrin kapak fotoğrafı olur.</p>
            </div>
          </div>

          {/* Gizli form alanları - veritabanına aktarılır */}
          <input type="hidden" name="imageUrl" value={imageList[0] ?? ""} />
          <input type="hidden" name="imageUrls" value={JSON.stringify(imageList)} />
          {imageList.map((url, i) => (
            <input key={i} type="hidden" name="productImages" value={url} />
          ))}

          {uploadError && (
            <div
              style={{
                padding: "10px 14px",
                marginBottom: "16px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              {uploadError}
            </div>
          )}

          {uploading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
                borderRadius: "8px",
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                color: "#0369a1",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <Loader2 size={18} className="animate-spin" />
              <span>{uploadProgress || "Görseller optimize edilip yükleniyor, lütfen bekleyin..."}</span>
            </div>
          )}

          {/* Yüklenmiş Görseller Listesi / Izgara */}
          {imageList.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1e293b" }}>
                    Yüklü Görseller ({imageList.length})
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      backgroundColor: "#dcfce7",
                      color: "#15803d",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    1. Görsel = Kapak
                  </span>
                </div>
                <span style={{ fontSize: "0.76rem", color: "#64748b" }}>
                  Sıralamayı oklarla değiştirebilir veya istediğiniz görseli kapak yapabilirsiniz.
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                  gap: "14px",
                }}
              >
                {imageList.map((url, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "12px",
                        border: isPrimary ? "2px solid #059669" : "1px solid #cbd5e1",
                        backgroundColor: "#fff",
                        overflow: "hidden",
                        boxShadow: isPrimary
                          ? "0 4px 12px rgba(5, 150, 105, 0.12)"
                          : "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Rozet */}
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          zIndex: 2,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: isPrimary ? "#059669" : "rgba(15, 23, 42, 0.75)",
                          color: "#fff",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {isPrimary ? (
                          <>
                            <Star size={11} fill="#fff" /> KAPAK GÖRSELİ
                          </>
                        ) : (
                          `Fotoğraf ${idx + 1}`
                        )}
                      </div>

                      {/* Görsel Önizleme */}
                      <div
                        style={{
                          width: "100%",
                          height: "150px",
                          backgroundColor: "#f8fafc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "8px",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <img
                          src={url}
                          alt={`Ürün görseli ${idx + 1}`}
                          style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      {/* Kontrol Butonları */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          padding: "10px",
                          backgroundColor: isPrimary ? "#f0fdf4" : "#f8fafc",
                        }}
                      >
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              width: "100%",
                              padding: "5px 8px",
                              borderRadius: "6px",
                              border: "1px solid #86efac",
                              backgroundColor: "#fff",
                              color: "#166534",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Star size={12} /> Kapak Yap
                          </button>
                        )}

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, -1)}
                            disabled={idx === 0}
                            title="Sola taşı"
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "5px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#fff",
                              color: idx === 0 ? "#cbd5e1" : "#475569",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                            }}
                          >
                            <ArrowLeft size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 1)}
                            disabled={idx === imageList.length - 1}
                            title="Sağa taşı"
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "5px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#fff",
                              color: idx === imageList.length - 1 ? "#cbd5e1" : "#475569",
                              cursor: idx === imageList.length - 1 ? "not-allowed" : "pointer",
                            }}
                          >
                            <ArrowRight size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Fotoğrafı sil"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "5px 8px",
                              borderRadius: "6px",
                              border: "1px solid #fecaca",
                              backgroundColor: "#fff",
                              color: "#dc2626",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Yeni Fotoğraf / Fotoğraflar Ekleme Alanı */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: imageList.length > 0 ? "24px 20px" : "36px 20px",
                borderRadius: "12px",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#f8fafc",
                cursor: uploading ? "not-allowed" : "pointer",
                textAlign: "center",
                transition: "border-color 0.2s, background-color 0.2s",
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={32} color="#0284c7" className="animate-spin" style={{ marginBottom: "8px" }} />
                  <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>Görseller Yükleniyor...</strong>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
                    {uploadProgress || "Lütfen işlem tamamlanana kadar bekleyin"}
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud size={36} color="#64748b" style={{ marginBottom: "8px" }} />
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                    {imageList.length > 0
                      ? "➕ Başka Fotoğraf(lar) Ekle (2-3 veya daha fazla seçebilirsiniz)"
                      : "Bilgisayarınızdan Ürün Fotoğraflarını Seçin (Toplu Seçim Yapabilirsiniz)"}
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
                    PNG, JPG, WEBP • Birden fazla dosyayı aynı anda seçebilirsiniz • Otomatik sıkıştırılır
                  </span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>

            {/* Hızlı Seçim: Hazır Galeri Görselleri */}
            <div style={{ marginTop: "4px" }}>
              <span
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  color: "#64748b",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                VEYA SİSTEMDEKİ HAZIR ÜRÜN GÖRSELLERİNDEN EKLEYİN:
              </span>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  { label: "Citrus No.1", url: "/images/citrus-no-01.jpg" },
                  { label: "Mineral No.2", url: "/images/mineral-no-02.jpg" },
                  { label: "Night No.3", url: "/images/night-no-03.jpg" },
                  { label: "Amber No.4", url: "/images/amber-no-04.jpg" },
                ].map((preset) => {
                  const alreadyAdded = imageList.includes(preset.url);
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handleAddPresetImage(preset.url)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: alreadyAdded ? "1px solid #86efac" : "1px solid #e2e8f0",
                        backgroundColor: alreadyAdded ? "#f0fdf4" : "#fff",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: alreadyAdded ? "#166534" : "#334155",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "cover" }}
                      />
                      <span>{preset.label}</span>
                      {alreadyAdded && <CheckCircle2 size={13} color="#166534" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: ÜCRETLENDİRME & KDV */}
        <section className="editor-card">
          <div className="editor-title">
            <span>03</span>
            <div>
              <h2>Ücretlendirme & KDV Detayları</h2>
              <p>Müşteri satış fiyatı, indirim öncesi liste fiyatı, resmi KDV oranı ve birim maliyet.</p>
            </div>
          </div>
          <div className="editor-fields">
            <label>
              <span className="editor-field-header">
                Satış fiyatı (₺ - KDV Dahil)
                <span className="editor-badge editor-badge-info">Zorunlu</span>
              </span>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Örn. 1250.00"
              />
              <span className="field-help">Müşterinin sepette ve sitede ödeyeceği nihai tutar.</span>
            </label>

            <label>
              <span className="editor-field-header">
                Eski / Liste fiyatı (₺)
                {discountPercent > 0 && (
                  <span className="editor-badge editor-badge-discount">
                    %{discountPercent} İndirim
                  </span>
                )}
              </span>
              <input
                name="compareAtPrice"
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Örn. 1450.00"
              />
              <span className="field-help">
                Kampanya ve indirimlerde üzeri çizili gösterilecek orijinal fiyat.
              </span>
            </label>

            <label>
              <span className="editor-field-header">
                KDV Oranı (%)
                <span className="editor-badge editor-badge-muted">%20 Standart</span>
              </span>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
              >
                <option value={20}>%20 - Kozmetik / Kolonya / Parfüm Standart Oranı</option>
                <option value={10}>%10 - İndirimli Oran</option>
                <option value={1}>%1 - Temel İhtiyaç Oranı</option>
                <option value={0}>%0 - KDV Muafiyeti</option>
              </select>
              <span className="field-help">
                Fatura düzenleme ve net satış geliri hesabında dikkate alınır.
              </span>
            </label>

            <label>
              <span className="editor-field-header">
                Birim Üretim Maliyeti (₺)
                <span className="editor-badge editor-badge-muted">Kâr Hesabı İçin</span>
              </span>
              <input
                name="unitCost"
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="Örn. 185.00"
              />
              <span className="field-help">
                Esans, akik taş kapak, cam şişe, lüks kutu ve işçilik toplam maliyeti.
              </span>
            </label>
          </div>
        </section>

        {/* SECTION 04: KARGO & LOJİSTİK POLİTİKASI */}
        <section className="editor-card">
          <div className="editor-title">
            <span>04</span>
            <div>
              <h2>Kargo Politikası & Lojistik Maliyetleri</h2>
              <p>Müşteri kargo ücret durumu, kargo anlaşma maliyeti, desi ve paket ağırlığı.</p>
            </div>
          </div>

          {/* Kargo Politikası Seçici */}
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#4e6172" }}>
              Müşteri Kargo Ücret Politikası
            </span>
            <div className="shipping-policy-options">
              {/* Option 1: Mağaza Standart Kuralı */}
              <label
                className={`shipping-policy-card ${shippingPolicy === "standard" ? "selected" : ""}`}
                onClick={() => setShippingPolicy("standard")}
              >
                <input
                  type="radio"
                  name="_ui_shipping_policy"
                  value="standard"
                  checked={shippingPolicy === "standard"}
                  readOnly
                />
                <div className="shipping-policy-top">
                  <Truck size={18} />
                  <span className="shipping-policy-badge">Mağaza Kuralı</span>
                </div>
                <strong>1.500 ₺ Üzeri Ücretsiz</strong>
                <p>1.500 ₺ üzeri siparişlerde kargo bedava, altındaki siparişlerde alıcıya 59 ₺ kargo yansır.</p>
              </label>

              {/* Option 2: Bu Ürüne Özel Ücretsiz Kargo */}
              <label
                className={`shipping-policy-card ${shippingPolicy === "free" ? "selected" : ""}`}
                onClick={() => setShippingPolicy("free")}
              >
                <input
                  type="radio"
                  name="_ui_shipping_policy"
                  value="free"
                  checked={shippingPolicy === "free"}
                  readOnly
                />
                <div className="shipping-policy-top">
                  <Gift size={18} />
                  <span className="shipping-policy-badge">Hediye Kargo</span>
                </div>
                <strong>Bu Ürüne Özel Ücretsiz Kargo</strong>
                <p>Sepet tutarından bağımsız olarak bu üründe kargo müşteriye tamamen BEDAVA sunulur.</p>
              </label>

              {/* Option 3: Alıcı Öder */}
              <label
                className={`shipping-policy-card ${shippingPolicy === "paid" ? "selected" : ""}`}
                onClick={() => setShippingPolicy("paid")}
              >
                <input
                  type="radio"
                  name="_ui_shipping_policy"
                  value="paid"
                  checked={shippingPolicy === "paid"}
                  readOnly
                />
                <div className="shipping-policy-top">
                  <Package size={18} />
                  <span className="shipping-policy-badge">Sabit Kargo</span>
                </div>
                <strong>Alıcı Öder / Sabit Ücret</strong>
                <p>Tüm siparişlerde kargo bedeli doğrudan alıcı tarafından karşılanır.</p>
              </label>
            </div>
          </div>

          {/* Lojistik Parametreleri */}
          <div className="editor-fields">
            <label>
              <span className="editor-field-header">
                Tahmini Kargo Gönderi Maliyeti (₺)
                <span className="editor-badge editor-badge-muted">Koli Başı</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={carrierCost}
                onChange={(e) => setCarrierCost(e.target.value)}
                placeholder="65.00"
              />
              <span className="field-help">
                Satıcının kargo firmasına (Yurtiçi, Aras vb.) fiilen ödediği sözleşmeli tutar.
              </span>
            </label>

            <label>
              <span className="editor-field-header">
                Hacimsel Desi (dm³)
                <span className="editor-badge editor-badge-muted">Paket Boyutu</span>
              </span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={desi}
                onChange={(e) => setDesi(e.target.value)}
                placeholder="1.0"
              />
              <span className="field-help">Standart 100ml veya 250ml kutulu kolonya ortalama 1 desidir.</span>
            </label>

            <label>
              <span className="editor-field-header">
                Brüt Paket Ağırlığı (Gram)
                <span className="editor-badge editor-badge-muted">Tartı Ağırlığı</span>
              </span>
              <input
                type="number"
                min="10"
                step="10"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="450"
              />
              <span className="field-help">Cam şişe, akik taşı kapak, özel kutu ve dolgu ağırlığı toplamı.</span>
            </label>

            <label>
              <span className="editor-field-header">
                Kargoya Teslimat Süresi
                <span className="editor-badge editor-badge-muted">Müşteri Güveni</span>
              </span>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              >
                <option value="same-day">Aynı Gün Kargo (Saat 15:00&apos;e kadar)</option>
                <option value="1-2-days">1 - 2 İş Gününde Kargoda (Standart)</option>
                <option value="2-3-days">2 - 3 İş Gününde Kargoda</option>
                <option value="custom">Sipariş Üzerine Hazırlanır (3-5 Gün)</option>
              </select>
              <span className="field-help">Ürün sayfasında müşteriye taahhüt edilen kargo süresi.</span>
            </label>
          </div>

          {/* CANLI KÂR & BİRİM İKTİSADİ SİMÜLATÖRÜ */}
          <div className="profit-sim-container">
            <div className="profit-sim-head">
              <div className="profit-sim-title">
                <Calculator size={18} />
                <span>Canlı Kâr & Birim İktisadi Simülatörü</span>
              </div>
              <div className={`profit-status-pill ${status.pillClass}`}>
                {status.pillClass === "excellent" || status.pillClass === "good" ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <AlertTriangle size={13} />
                )}
                <span>{status.label}</span>
              </div>
            </div>

            {/* 4 Özet Kart */}
            <div className="profit-sim-grid">
              <div className="profit-sim-metric">
                <span>MÜŞTERİ SATIŞ FİYATI</span>
                <strong>{priceNum > 0 ? formatTL(priceNum) : "₺0,00"}</strong>
                <small>KDV Dahil Tutar</small>
              </div>

              <div className="profit-sim-metric">
                <span>KDV PAYI (%{vatRate})</span>
                <strong style={{ color: "#7b5025" }}>
                  {priceNum > 0 ? formatTL(vatAmount) : "₺0,00"}
                </strong>
                <small>Resmi Vergi Kesintisi</small>
              </div>

              <div className="profit-sim-metric">
                <span>DOĞRUDAN MALİYET</span>
                <strong style={{ color: "#a83b24" }}>
                  {priceNum > 0 ? formatTL(totalDirectCost) : "₺0,00"}
                </strong>
                <small>Üretim + Kargo Yükü</small>
              </div>

              <div
                className={`profit-sim-metric ${
                  netProfit > 0
                    ? "highlight-profit"
                    : netProfit < 0
                    ? "highlight-danger"
                    : ""
                }`}
              >
                <span>TAHMİNİ NET KÂR</span>
                <strong>{priceNum > 0 ? formatTL(netProfit) : "₺0,00"}</strong>
                <small>
                  {priceNum > 0 ? `Net Kâr Marjı: %${profitMargin.toFixed(1)}` : "Satış fiyatı bekleniyor"}
                </small>
              </div>
            </div>

            {/* Şelale Finansal Döküm Tablosu */}
            <div className="profit-waterfall">
              <div className="profit-waterfall-row">
                <span>(+) Müşteri Satış Fiyatı (KDV Dahil)</span>
                <span>{priceNum > 0 ? formatTL(priceNum) : "₺0,00"}</span>
              </div>
              <div className="profit-waterfall-row">
                <span>(-) KDV Payı (%{vatRate})</span>
                <span style={{ color: "#a83b24" }}>-{formatTL(vatAmount)}</span>
              </div>
              <div className="profit-waterfall-row" style={{ fontWeight: 700, color: "#192f42" }}>
                <span>(=) Net Satış Hasılatı (KDV Hariç)</span>
                <span>{formatTL(netRevenue)}</span>
              </div>
              <div className="profit-waterfall-row">
                <span>(-) Birim Üretim Maliyeti (Şişe, Esans, Akik Taşı, Kutu)</span>
                <span style={{ color: "#a83b24" }}>-{formatTL(costNum)}</span>
              </div>
              <div className="profit-waterfall-row">
                <span>
                  (-) Satıcıya Yansıyan Kargo Maliyeti (
                  <small style={{ color: "#617789" }}>{shippingCustomerExplanation}</small>)
                </span>
                <span style={{ color: "#a83b24" }}>-{formatTL(sellerShippingExpense)}</span>
              </div>
              <div
                className={`profit-waterfall-row total ${
                  netProfit < 0 ? "is-negative" : ""
                }`}
              >
                <span>(=) TAHMİNİ NET BİRİM KÂRI</span>
                <span>
                  {formatTL(netProfit)} (%{profitMargin.toFixed(1)} Marj)
                </span>
              </div>
            </div>

            <div className="profit-sim-note">
              <Info size={14} />
              <span>{status.desc}</span>
            </div>
          </div>
        </section>

        {/* SECTION 05: ENVANTER & STOK */}
        <section className="editor-card">
          <div className="editor-title">
            <span>05</span>
            <div>
              <h2>Envanter & Stok</h2>
              <p>Stok kodu (SKU), şişe hacmi ve kritik stok uyarı seviyesi.</p>
            </div>
          </div>
          <div className="editor-fields">
            <label>
              SKU (Stok Kodu)
              <input
                name="sku"
                required
                pattern="[A-Za-z0-9\-]{3,100}"
                defaultValue={data.sku ?? ""}
                placeholder="DRM-CT-100"
              />
            </label>
            <label>
              Hacim (ML)
              <input
                name="volumeMl"
                type="number"
                min="1"
                required
                defaultValue={data.volumeMl ?? 100}
              />
            </label>
            <label>
              Mevcut Stok Miktarı (Adet)
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={data.stock ?? 0}
              />
            </label>
            <label>
              Düşük Stok Uyarısı (Eşik)
              <input
                name="lowStockThreshold"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={data.lowStockThreshold ?? 5}
              />
            </label>
          </div>
        </section>

        {/* SECTION 06: ARAMA MOTORU (SEO) */}
        <section className="editor-card">
          <div className="editor-title">
            <span>06</span>
            <div>
              <h2>Arama Motoru Görünümü (SEO)</h2>
              <p>Google arama sonuçları ve sosyal medya paylaşımlarında listelenecek başlık ve özet.</p>
            </div>
          </div>
          <div className="editor-fields">
            <label className="editor-wide">
              SEO Başlığı (Maksimum 160 karakter)
              <input
                name="seoTitle"
                maxLength={160}
                defaultValue={data.seoTitle ?? ""}
                placeholder="Dr. Mars Citrus No. 01 | Akik Taşlı Doğal Lüks Kolonya"
              />
            </label>
            <label className="editor-wide">
              SEO Açıklaması (Meta Description)
              <textarea
                name="seoDescription"
                maxLength={320}
                rows={3}
                defaultValue={data.seoDescription ?? ""}
                placeholder="Mardin'in kadim taş işçiliği ve taze bergamot esintisiyle bezenmiş lüks kolonya serisi."
              />
            </label>
          </div>
        </section>
      </div>

      {/* ASIDE PANEL */}
      <aside className="product-editor-aside">
        <section className="editor-card">
          <h2>Yayın durumu</h2>
          <label className="editor-status">
            <input
              type="radio"
              name="status"
              value="active"
              defaultChecked={data.active !== false}
            />
            <span>
              <b>Yayında</b>
              <small>Mağazada satışa açık, sepete eklenebilir</small>
            </span>
          </label>
          <label className="editor-status">
            <input
              type="radio"
              name="status"
              value="draft"
              defaultChecked={data.active === false}
            />
            <span>
              <b>Taslak</b>
              <small>Müşterilere gösterilmez, düzenleme aşamasında</small>
            </span>
          </label>
          <label className="editor-featured">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={data.featured}
            />
            Öne çıkan koleksiyon ürünü
          </label>
        </section>

        <section className="editor-card">
          <h2>Vitrin & Sıralama</h2>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "#334155" }}>
            <span>Vitrin Sıra Numarası (Küçük sayı en üstte)</span>
            <input
              name="sortOrder"
              type="number"
              min="0"
              step="1"
              defaultValue={data.sortOrder ?? 0}
              placeholder="0 (Örn: 1, 2, 3)"
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
              }}
            />
          </label>
          <small style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px", display: "block", lineHeight: "1.3" }}>
            Anasayfada en yukarıda listelenmesini istediğiniz ürüne (örn. Zeytin) 1 verin.
          </small>
        </section>

        <section className="editor-card editor-summary">
          <span>{mode === "create" ? "YENİ ÜRÜN OLUŞTURMA" : "ÜRÜN GÜNCELLEME"}</span>
          <p>
            Zorunlu alanlar doldurulduğunda ürün, fiyatlandırma, kargo ve stok tek adımda güvenle sisteme kaydedilir.
          </p>
          <button type="submit">
            {mode === "create" ? "Ürünü kaydet" : "Değişiklikleri kaydet"}
          </button>
          <Link href="/admin/urunler">İptal et ve ürünlere dön</Link>
        </section>
      </aside>
    </form>
  );
}
