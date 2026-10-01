import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type CargoProvider = "yurtici" | "simulation" | "aras" | "mng";
export type CargoMode = "test" | "live";
export type CargoPayerType = "sender" | "receiver"; // "sender" = GÖ (Gönderici Ödemeli), "receiver" = AÖ (Alıcı Ödemeli)

export interface CargoSettings {
  mode: CargoMode;
  provider: CargoProvider;
  // Gönderici Ödemeli (GÖ) Web Servis Bilgileri
  yurticiGoUsername: string;
  yurticiGoPassword: string;
  // Alıcı Ödemeli (AÖ) Web Servis Bilgileri
  yurticiAoUsername: string;
  yurticiAoPassword: string;
  // Müşteri & Çıkış Şubesi
  yurticiCustomerCode: string;
  yurticiUnitCode: string;
  yurticiUnitName: string;
  // Geriye dönük uyumluluk
  yurticiUsername?: string;
  yurticiPassword?: string;
  // Gönderici Firma Bilgileri
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderDistrict: string;
  senderPhone: string;
}

export const DEFAULT_CARGO_SETTINGS: CargoSettings = {
  mode: "test",
  provider: "yurtici",
  yurticiGoUsername: "8077N334695105G",
  yurticiGoPassword: "604dMr40JY9g32Dd",
  yurticiAoUsername: "8077N334695105A",
  yurticiAoPassword: "2Ax622DSE9H6F1Uh",
  yurticiCustomerCode: "334695105",
  yurticiUnitCode: "8077",
  yurticiUnitName: "ARTUKLU",
  senderName: "LAVİN KİMYA KOZMETİK PLASTİK SANAYİ VE TİCARET LİMİTED ŞİRKETİ",
  senderAddress: "Şar Mah. 1. Cadde No: 284",
  senderCity: "Mardin",
  senderDistrict: "Artuklu",
  senderPhone: "+90 (482) 212 19 03",
};


/**
 * Veritabanından güncel kargo yapılandırmasını alır.
 */
export async function getCargoSettings(): Promise<CargoSettings> {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "cargo"))
      .limit(1);

    if (!row?.value) {
      return DEFAULT_CARGO_SETTINGS;
    }

    return {
      ...DEFAULT_CARGO_SETTINGS,
      ...(row.value as Partial<CargoSettings>),
    };
  } catch (error) {
    console.error("Kargo ayarları okunamadı, varsayılanlar kullanılıyor:", error);
    return DEFAULT_CARGO_SETTINGS;
  }
}

/**
 * Kargo takip numarası için taşıyıcı firmanın online takip linkini üretir.
 */
export function getCargoTrackingUrl(company: string | null | undefined, trackingNumber: string | null | undefined): string | null {
  if (!trackingNumber) return null;
  const cleanNumber = trackingNumber.trim();
  const lowerCompany = (company || "yurtici").toLowerCase();

  if (lowerCompany.includes("yurtiçi") || lowerCompany.includes("yurtici")) {
    return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(cleanNumber)}`;
  }

  if (lowerCompany.includes("aras")) {
    return `https://kargotakip.araskargo.com.tr/?code=${encodeURIComponent(cleanNumber)}`;
  }

  if (lowerCompany.includes("mng")) {
    return `https://kargotakip.mngkargo.com.tr/?takipNo=${encodeURIComponent(cleanNumber)}`;
  }

  if (lowerCompany.includes("ptt")) {
    return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(cleanNumber)}`;
  }

  if (lowerCompany.includes("sürat") || lowerCompany.includes("surat")) {
    return `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${encodeURIComponent(cleanNumber)}`;
  }

  if (lowerCompany.includes("hepsijet")) {
    return `https://hepsijet.com/gonderi-takibi/${encodeURIComponent(cleanNumber)}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${company || "kargo"} takip ${cleanNumber}`)}`;
}

export interface ShipmentOrderData {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  addressLine: string;
  district: string;
  city: string;
  totalAmount: number;
  paymentMethod?: string;
  itemsCount: number;
  payerType?: CargoPayerType; // "sender" = GÖ (Gönderici Ödemeli), "receiver" = AÖ (Alıcı Ödemeli)
}

export interface ShipmentResult {
  success: boolean;
  trackingNumber?: string;
  cargoCompany: string;
  message: string;
  barcode?: string;
  trackingUrl?: string;
  payerType?: CargoPayerType;
  payerLabel?: string;
}

/**
 * Sipariş için Kargo Gönderisi Oluşturur.
 * Gönderici Ödemeli (GÖ) veya Alıcı Ödemeli (AÖ) seçimine göre ilgili Yurtiçi Kargo API hesabını kullanır.
 * Test modunda veya API bilgisi girilmediğinde güvenli Yurtiçi Kargo simülasyonu çalıştırır.
 * Canlı modda doğrudan Yurtiçi Kargo SOAP Web Servisine istek atar.
 */
export async function createCargoShipment(
  order: ShipmentOrderData,
  customSettings?: CargoSettings
): Promise<ShipmentResult> {
  const settings = customSettings || (await getCargoSettings());

  const isLive = settings.mode === "live";
  const payerType: CargoPayerType = order.payerType || "sender";
  const isReceiverPaying = payerType === "receiver";

  // GÖ veya AÖ seçimine göre ilgili web servis kullanıcısını seç
  const activeUsername = isReceiverPaying
    ? (settings.yurticiAoUsername || settings.yurticiUsername || "8077N334695105A")
    : (settings.yurticiGoUsername || settings.yurticiUsername || "8077N334695105G");

  const activePassword = isReceiverPaying
    ? (settings.yurticiAoPassword || settings.yurticiPassword || "2Ax622DSE9H6F1Uh")
    : (settings.yurticiGoPassword || settings.yurticiPassword || "604dMr40JY9g32Dd");

  const payerLabel = isReceiverPaying ? "Alıcı Ödemeli (AÖ)" : "Gönderici Ödemeli (GÖ)";

  const hasYurticiCredentials =
    Boolean(activeUsername?.trim()) &&
    Boolean(activePassword?.trim()) &&
    Boolean(settings.yurticiCustomerCode?.trim());

  // Eğer Canlı Mod ve API bilgileri varsa gerçek Yurtiçi SOAP Web Servisi
  if (isLive && hasYurticiCredentials && settings.provider === "yurtici") {
    try {
      const endpoint = "https://webservices.yurticikargo.com:9090/ShippingOrderDispatcherServices/ShippingOrderDispatcher";
      
      const isCod = order.paymentMethod === "cash_on_delivery";
      const codAmount = isCod ? order.totalAmount.toFixed(2) : "0";

      // Yurtiçi Kargo SOAP Request Envelope
      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ship="http://yurticikargo.com.tr/ShippingOrderDispatcherServices">
  <soapenv:Header/>
  <soapenv:Body>
    <ship:createShipment>
      <wsUserName>${escapeXml(activeUsername)}</wsUserName>
      <wsPassword>${escapeXml(activePassword)}</wsPassword>
      <userLanguage>TR</userLanguage>
      <ShippingOrderVO>
        <cargoKey>${escapeXml(order.orderNumber)}</cargoKey>
        <invoiceKey>${escapeXml(order.orderNumber)}</invoiceKey>
        <receiverCustName>${escapeXml(order.recipientName)}</receiverCustName>
        <receiverAddress>${escapeXml(order.addressLine)}</receiverAddress>
        <cityName>${escapeXml(order.city)}</cityName>
        <townName>${escapeXml(order.district)}</townName>
        <receiverPhone1>${escapeXml(order.recipientPhone.replace(/\D/g, ""))}</receiverPhone1>
        <cargoCount>${Math.max(1, order.itemsCount)}</cargoCount>
        <ttDocumentId></ttDocumentId>
        <ttCollectionType>${isCod ? "0" : "0"}</ttCollectionType>
        <ttInvoiceAmount>${codAmount}</ttInvoiceAmount>
        <ttDocumentFlag>${isCod ? "1" : "0"}</ttDocumentFlag>
        <desi>1</desi>
        <kg>1</kg>
      </ShippingOrderVO>
    </ship:createShipment>
  </soapenv:Body>
</soapenv:Envelope>`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "createShipment",
        },
        body: soapBody,
      });

      const responseText = await res.text();

      // XML Yanıtını kontrol et
      if (!res.ok || responseText.includes("<outFlag>1</outFlag>") || responseText.includes("Fault>")) {
        const errorMatch = responseText.match(/<outResult>(.*?)<\/outResult>/) || responseText.match(/<faultstring>(.*?)<\/faultstring>/);
        const errDetail = errorMatch ? errorMatch[1] : "Yurtiçi Kargo servisi beklenmeyen bir yanıt verdi.";
        
        console.error("Yurtiçi Kargo SOAP Hatası:", errDetail, responseText);
        return {
          success: false,
          cargoCompany: `Yurtiçi Kargo (${payerLabel})`,
          message: `Yurtiçi Kargo API Hatası: ${errDetail}`,
          payerType,
          payerLabel,
        };
      }

      // Başarılı Yurtiçi Yanıtından takip no veya kargo anahtarını al
      const trackingMatch =
        responseText.match(/<cargoKey>(.*?)<\/cargoKey>/) ||
        responseText.match(/<jobId>(.*?)<\/jobId>/);

      const trackingNumber = trackingMatch ? trackingMatch[1] : order.orderNumber;

      return {
        success: true,
        cargoCompany: `Yurtiçi Kargo (${payerLabel})`,
        trackingNumber,
        trackingUrl: getCargoTrackingUrl("Yurtiçi Kargo", trackingNumber) || undefined,
        barcode: trackingNumber,
        payerType,
        payerLabel,
        message: `Yurtiçi Kargo sistemine gönderi başarıyla iletildi (${payerLabel}).`,
      };
    } catch (apiError: any) {
      console.error("Yurtiçi Kargo bağlantı hatası:", apiError);
      return {
        success: false,
        cargoCompany: `Yurtiçi Kargo (${payerLabel})`,
        message: `Kargo sunucusuna ulaşılamadı: ${apiError?.message || "Ağ hatası"}`,
        payerType,
        payerLabel,
      };
    }
  }

  // TEST / SİMÜLASYON MODU
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  const simulatedTrackingNumber = `YK${randomSuffix}`;

  return {
    success: true,
    cargoCompany: `Yurtiçi Kargo (${payerLabel})`,
    trackingNumber: simulatedTrackingNumber,
    trackingUrl: getCargoTrackingUrl("Yurtiçi Kargo", simulatedTrackingNumber) || undefined,
    barcode: simulatedTrackingNumber,
    payerType,
    payerLabel,
    message: isLive && !hasYurticiCredentials
      ? `Canlı mod seçili ancak API bilgileri eksik olduğu için test kodu üretildi (${payerLabel}).`
      : `Yurtiçi Kargo gönderisi (Test Modu) başarıyla oluşturuldu (${payerLabel}).`,
  };
}

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
        default: return c;
      }
    });
}

// ---------------------------------------------------------------------------
// Pure SVG Code-128 Barcode Generator (Sıfır bağımlılık, ultra hızlı ve vektörel)
// ---------------------------------------------------------------------------

const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

/**
 * Verilen metin veya takip no için standart SVG formatında Code-128 barkod oluşturur.
 */
export function generateBarcodeSvg(
  text: string,
  options: { height?: number; width?: number; showText?: boolean } = {}
): string {
  const { height = 60, width = 280, showText = true } = options;
  const clean = text.trim() || "000000000000";

  // Code 128 Set B Kodlama
  const codes: number[] = [104]; // Start B
  let checksum = 104;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) - 32;
    const validCode = code >= 0 && code <= 94 ? code : 0;
    codes.push(validCode);
    checksum += validCode * (i + 1);
  }

  codes.push(checksum % 103);
  codes.push(106); // Stop

  // Modülleri çıkar
  let patternStr = "";
  for (const c of codes) {
    patternStr += CODE128_PATTERNS[c] || "212222";
  }

  // Toplam modül genişliğini hesapla
  let totalModules = 0;
  for (const digit of patternStr) {
    totalModules += parseInt(digit, 10);
  }

  // Barları SVG çizim elemanına dönüştür
  let currentX = 10;
  const quietZone = 10;
  const svgTotalWidth = width;
  const scale = (svgTotalWidth - quietZone * 2) / totalModules;
  const barHeight = showText ? height - 18 : height;

  let rects = "";
  let isBar = true;

  for (const digit of patternStr) {
    const barWidth = parseInt(digit, 10) * scale;
    if (isBar) {
      rects += `<rect x="${currentX.toFixed(2)}" y="0" width="${barWidth.toFixed(2)}" height="${barHeight}" fill="#000000" />`;
    }
    currentX += barWidth;
    isBar = !isBar;
  }

  const textElement = showText
    ? `<text x="${(svgTotalWidth / 2).toFixed(2)}" y="${height - 2}" font-family="monospace, Courier, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#111827" letter-spacing="2">${clean}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgTotalWidth} ${height}" width="${svgTotalWidth}" height="${height}" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <rect width="${svgTotalWidth}" height="${height}" fill="#ffffff"/>
    ${rects}
    ${textElement}
  </svg>`;
}
