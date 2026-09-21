export interface OrderNotificationPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: "credit_card" | "bank_transfer" | "cash_on_delivery";
  items: {
    productName: string;
    variantName?: string | null;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    city: string;
    district: string;
    addressLine: string;
  };
}

/**
 * Sipariş onay e-postası HTML şablonu üretir.
 */
export function generateOrderConfirmationEmailHtml(order: OrderNotificationPayload): string {
  const methodLabel =
    order.paymentMethod === "credit_card"
      ? "Kredi Kartı"
      : order.paymentMethod === "bank_transfer"
      ? "Havale / EFT"
      : "Kapıda Ödeme";

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0eee6;">
          <strong style="color: #101e2c; font-size: 13px;">${item.productName}</strong><br/>
          <span style="color: #78716c; font-size: 11px;">${item.variantName || ""} × ${item.quantity} adet</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0eee6; text-align: right; color: #101e2c; font-weight: bold; font-size: 13px;">
          ₺${(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Siparişiniz Alındı - Dr. Mars</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f6f2; margin: 0; padding: 30px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4;">
          <div style="background-color: #101e2c; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase;">DR. MARS</h1>
            <p style="color: #c5a880; margin: 5px 0 0; font-size: 11px; letter-spacing: 1px;">HAUTE PARFUMERIE & APOTHECARY</p>
          </div>
          <div style="padding: 30px 24px;">
            <h2 style="color: #1c1917; font-size: 18px; margin-top: 0;">Sayın ${order.customerName},</h2>
            <p style="color: #57534e; font-size: 14px; line-height: 1.5;">
              Siparişiniz başarıyla alındı ve özenle hazırlanmak üzere laboratuvarımıza iletildi.
            </p>
            <div style="background-color: #fdfbf7; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #78716c;">SİPARİŞ NUMARASI</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #101e2c; font-family: monospace;">${order.orderNumber}</p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #78716c;">ÖDEME YÖNTEMİ: <strong style="color: #101e2c;">${methodLabel}</strong></p>
            </div>
            
            <h3 style="color: #1c1917; font-size: 14px; margin: 24px 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">Sipariş Özeti</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 14px 0 0; font-weight: bold; color: #1c1917; font-size: 14px;">Toplam Tutar</td>
                <td style="padding: 14px 0 0; text-align: right; font-weight: bold; color: #101e2c; font-size: 16px;">
                  ₺${order.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0eee6;">
              <h4 style="margin: 0 0 6px; font-size: 12px; color: #78716c; text-transform: uppercase;">Teslimat Adresi</h4>
              <p style="margin: 0; font-size: 13px; color: #44403c; line-height: 1.4;">
                ${order.shippingAddress.addressLine}<br/>
                ${order.shippingAddress.district} / ${order.shippingAddress.city}
              </p>
            </div>
          </div>
          <div style="background-color: #fafaf9; padding: 16px 24px; text-align: center; border-top: 1px solid #e7e5e4;">
            <p style="margin: 0; font-size: 11px; color: #78716c;">
              Sorularınız için WhatsApp destek hattımızdan (+90 482 212 19 03) sipariş numaranızla bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * WhatsApp müşteri sipariş teyit linki oluşturur.
 */
export function generateWhatsAppOrderUrl(orderNumber: string, customerPhone?: string): string {
  const storePhone = "904822121903";
  const message = `Merhaba Dr. Mars ekibi, ${orderNumber} numaralı siparişim hakkında bilgi almak istiyorum.`;
  return `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Sipariş bildirimini kaydeder / gönderir.
 */
export async function sendOrderNotification(order: OrderNotificationPayload): Promise<void> {
  console.log(`[OrderNotification] Sipariş bildirimi oluşturuldu: ${order.orderNumber} -> ${order.customerEmail}`);
  // Gelecekte Resend/Sendgrid veya SMS gateway eklendiğinde buradan otomatik tetiklenir.
}
