import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();
  const subtotal = Number(searchParams.get("subtotal") ?? 0);

  if (!code) {
    return NextResponse.json({ success: false, message: "Kupon kodu giriniz." }, { status: 400 });
  }

  try {
    const db = getDb();
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code), eq(coupons.isActive, true)))
      .limit(1);

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Geçersiz veya süresi dolmuş kupon kodu." }, { status: 404 });
    }

    if (coupon.minimumOrderAmount && subtotal < Number(coupon.minimumOrderAmount)) {
      return NextResponse.json(
        {
          success: false,
          message: `Bu kupon için minimum sipariş tutarı ₺${Number(coupon.minimumOrderAmount).toLocaleString("tr-TR")}'dir.`,
        },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: "Bu kuponun kullanım limiti dolmuştur." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
      },
    });
  } catch (error) {
    console.error("Kupon sorgu hatası:", error);
    return NextResponse.json({ success: false, message: "Kupon sorgulanamadı." }, { status: 500 });
  }
}
