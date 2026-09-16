"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { productReviews } from "@/db/schema";

type AddReviewInput = {
  productId: string;
  slug: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
};

export async function addReviewAction(input: AddReviewInput) {
  try {
    const { productId, slug, authorName, rating, title, comment } = input;

    if (!productId || !slug) {
      return { success: false, error: "Geçersiz ürün bilgisi." };
    }

    if (!authorName || authorName.trim().length < 2) {
      return { success: false, error: "Lütfen geçerli bir isim giriniz." };
    }

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: "Lütfen 1 ile 5 arasında bir puan veriniz." };
    }

    if (!comment || comment.trim().length < 5) {
      return { success: false, error: "Değerlendirmeniz en az 5 karakter olmalıdır." };
    }

    const db = getDb();
    await db.insert(productReviews).values({
      productId,
      authorName: authorName.trim(),
      rating: Math.round(rating),
      title: title?.trim() || null,
      comment: comment.trim(),
      isApproved: true, // Otomatik onaylı (admin panelinden yönetilebilir)
    });

    revalidatePath(`/urun/${slug}`);
    return { success: true };
  } catch (error) {
    console.error("Yorum ekleme hatası:", error);
    return { success: false, error: "Yorum kaydedilirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}
