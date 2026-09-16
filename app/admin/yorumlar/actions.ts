"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { productReviews } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

export async function toggleReviewApprovalAction(reviewId: string, currentStatus: boolean) {
  if (!(await isAdmin())) {
    throw new Error("Yetkisiz işlem.");
  }

  const db = getDb();
  await db
    .update(productReviews)
    .set({
      isApproved: !currentStatus,
      updatedAt: new Date(),
    })
    .where(eq(productReviews.id, reviewId));

  revalidatePath("/admin/yorumlar");
  return { success: true };
}

export async function deleteReviewAction(reviewId: string) {
  if (!(await isAdmin())) {
    throw new Error("Yetkisiz işlem.");
  }

  const db = getDb();
  await db.delete(productReviews).where(eq(productReviews.id, reviewId));

  revalidatePath("/admin/yorumlar");
  return { success: true };
}
