"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { deleteReviewAction, toggleReviewApprovalAction } from "./actions";
import { toast } from "sonner";

export type AdminReview = {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
};

export function ReviewsClient({ initialReviews }: { initialReviews: AdminReview[] }) {
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = reviews.filter((r) => {
    if (filter === "approved" && !r.isApproved) return false;
    if (filter === "pending" && r.isApproved) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchAuthor = r.authorName.toLowerCase().includes(q);
      const matchProduct = (r.productName ?? "").toLowerCase().includes(q);
      const matchComment = r.comment.toLowerCase().includes(q);
      return matchAuthor || matchProduct || matchComment;
    }
    return true;
  });

  const handleToggle = (review: AdminReview) => {
    startTransition(async () => {
      try {
        await toggleReviewApprovalAction(review.id, review.isApproved);
        setReviews((prev) =>
          prev.map((item) =>
            item.id === review.id ? { ...item, isApproved: !item.isApproved } : item
          )
        );
        toast.success(
          review.isApproved
            ? "Yorum yayından kaldırıldı."
            : "Yorum onaylandı ve yayına alındı."
        );
      } catch {
        toast.error("Durum güncellenirken bir hata oluştu.");
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    if (!confirm("Bu değerlendirmeyi kalıcı olarak silmek istediğinize emin misiniz?")) return;

    startTransition(async () => {
      try {
        await deleteReviewAction(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast.success("Yorum başarıyla silindi.");
      } catch {
        toast.error("Yorum silinemedi.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            Tümü ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === "approved"
                ? "bg-emerald-700 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            Onaylananlar ({reviews.filter((r) => r.isApproved).length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === "pending"
                ? "bg-amber-600 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            Bekleyenler ({reviews.filter((r) => !r.isApproved).length})
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Yorumlarda veya üründe ara..."
            className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-4 py-2 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Review Cards / List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <MessageSquare size={36} className="mx-auto text-stone-400" />
            <p className="mt-3 text-sm font-bold text-stone-800">
              Henüz kriterlere uygun değerlendirme bulunmuyor.
            </p>
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition-all ${
                rev.isApproved ? "border-stone-200" : "border-amber-300 bg-amber-50/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-stone-900">
                    {rev.authorName}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-200"
                        }
                      />
                    ))}
                  </div>
                  {rev.isApproved ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle size={12} /> Yayında
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <Clock size={12} /> Onay Bekliyor
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  {rev.productSlug && (
                    <Link
                      href={`/urun/${rev.productSlug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-stone-700 hover:text-black font-bold"
                    >
                      <span>{rev.productName ?? "Ürün"}</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                  <span>
                    {new Intl.DateTimeFormat("tr-TR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(rev.createdAt))}
                  </span>
                </div>
              </div>

              <div className="pt-3">
                {rev.title && (
                  <h4 className="text-sm font-bold text-stone-900 mb-1">
                    {rev.title}
                  </h4>
                )}
                <p className="text-xs text-stone-700 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  onClick={() => handleToggle(rev)}
                  disabled={isPending}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    rev.isApproved
                      ? "border border-stone-300 text-stone-700 hover:bg-stone-100"
                      : "bg-emerald-700 text-white hover:bg-emerald-800"
                  }`}
                >
                  {rev.isApproved ? (
                    <>
                      <XCircle size={14} /> Yayından Kaldır
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> Yayına Al / Onayla
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(rev.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} /> Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
