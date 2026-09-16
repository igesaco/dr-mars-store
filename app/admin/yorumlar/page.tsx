import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { productReviews, products } from "@/db/schema";
import { ReviewsClient } from "./reviews-client";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const db = getDb();
  const rawReviews = await db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      productName: products.name,
      productSlug: products.slug,
      authorName: productReviews.authorName,
      rating: productReviews.rating,
      title: productReviews.title,
      comment: productReviews.comment,
      isApproved: productReviews.isApproved,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .leftJoin(products, eq(productReviews.productId, products.id))
    .orderBy(desc(productReviews.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900">
          Müşteri Değerlendirmeleri & Yorumlar
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Kullanıcılar tarafından mağazadaki ürünlere yapılan tüm yorumları inceleyin, onaylayın veya yönetin.
        </p>
      </div>

      <ReviewsClient initialReviews={rawReviews} />
    </div>
  );
}
