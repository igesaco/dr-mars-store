"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  MessageSquarePlus,
  BadgeCheck,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { addReviewAction } from "./review-actions";
import { toast } from "sonner";

type Variant = {
  id: string;
  name: string;
  sku: string;
  volumeMl: number | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
};

export type ReviewItem = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: Date;
};

type ProductProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    fragranceNotes: string[] | null;
    categoryName?: string | null;
    categorySlug?: string | null;
    variants: Variant[];
    imageUrl: string | null;
  };
  reviews?: ReviewItem[];
};

export function ProductView({ product, reviews = [] }: ProductProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const favorited = isFavorite(product.id);

  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    product.variants[0] ?? {
      id: "",
      name: "",
      sku: "",
      volumeMl: 100,
      price: "0",
      compareAtPrice: null,
      stock: 0,
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Calculate review metrics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, pct };
  });

  const handleAddToCart = () => {
    if (!selectedVariant.id) return;
    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        price: Number(selectedVariant.price),
        volumeMl: selectedVariant.volumeMl ?? undefined,
        image: product.imageUrl ?? undefined,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: selectedVariant.price,
      imageUrl: product.imageUrl,
      shortDescription: product.shortDescription,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      toast.error("Lütfen adınızı ve soyadınızı girin.");
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      toast.error("Lütfen en az 5 karakterlik bir yorum yazın.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await addReviewAction({
        productId: product.id,
        slug: product.slug,
        authorName,
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.success) {
        toast.success("Değerlendirmeniz başarıyla eklendi! Teşekkür ederiz.");
        setShowReviewForm(false);
        setAuthorName("");
        setReviewTitle("");
        setReviewComment("");
        setRating(5);
      } else {
        toast.error(res.error || "Yorum kaydedilemedi.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isOutOfStock = selectedVariant.stock <= 0;

  return (
    <>
      <section className="grid min-h-[calc(100vh-130px)] lg:grid-cols-2">
        {/* Product Image / Art Showcase */}
        <div className="relative flex min-h-[480px] lg:min-h-full items-center justify-center p-8 bg-gradient-to-br from-[#d7ff99] to-[#849649] text-white">
          <div className="text-center">
            <span className="text-sm font-black tracking-widest uppercase opacity-80">
              DR MARS · MODERN COLOGNE
            </span>
            <h2 className="mt-4 text-6xl sm:text-8xl font-black tracking-tighter">
              {product.name}
            </h2>
            <p className="mt-4 text-sm font-semibold tracking-wider text-black/60 uppercase">
              {selectedVariant.name} · %80 ALKOL BAZLI FORMÜL
            </p>
          </div>

          <div className="absolute bottom-6 left-6 text-2xl font-black tracking-tighter opacity-70">
            DR MARS
          </div>

          {/* Quick Wishlist Float Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-md backdrop-blur transition-transform hover:scale-110"
            aria-label="Favorilere ekle"
          >
            <Heart
              size={20}
              className={favorited ? "fill-rose-500 text-rose-500" : "text-stone-700"}
            />
          </button>
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-[#fbfbfa]">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
            <Link href="/" className="hover:text-black">
              Ana Sayfa
            </Link>
            <span>/</span>
            {product.categorySlug ? (
              <Link href={`/kategori/${product.categorySlug}`} className="hover:text-black">
                {product.categoryName ?? "Kategori"}
              </Link>
            ) : (
              <span>Kolonyalar</span>
            )}
            <span>/</span>
            <span className="text-stone-900">{product.name}</span>
          </div>

          {/* Title & Short Description */}
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8f7351] mb-1 block">
            PATENTLİ AKİK TAŞLI FORMÜLASYON
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-bold tracking-tight text-stone-950">
            {product.name}
          </h1>

          {/* Rating Snapshot */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={
                    s <= Math.round(Number(avgRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300"
                  }
                />
              ))}
            </div>
            <a
              href="#degerlendirmeler"
              className="text-xs font-extrabold text-stone-700 hover:text-black underline underline-offset-4"
            >
              {avgRating} ({totalReviews} Müşteri Değerlendirmesi)
            </a>
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-base text-stone-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Pricing */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-black text-stone-900">
              ₺{Number(selectedVariant.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
            {selectedVariant.compareAtPrice && (
              <span className="text-lg text-stone-400 line-through">
                ₺{Number(selectedVariant.compareAtPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            )}
            <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              KDV Dahil
            </span>
          </div>

          {/* Fragrance Notes Chips */}
          {product.fragranceNotes && product.fragranceNotes.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
                Koku Piramidi
              </p>
              <div className="flex flex-wrap gap-2">
                {product.fragranceNotes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-bold text-stone-700"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selector (ML size) */}
          {product.variants.length > 1 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                  Şişe Boyutu
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  SKU: {selectedVariant.sku}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl border px-5 py-3 text-xs font-bold transition-all ${
                        isSelected
                          ? "border-[#c5a880] bg-[#0e131a] text-[#dfcca8] shadow-md"
                          : "border-stone-300 bg-white text-stone-800 hover:border-[#c5a880]/50"
                      }`}
                    >
                      <span className="text-sm font-bold">{v.name}</span>
                      <span
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? "text-[#c5a880]" : "text-stone-500"
                        }`}
                      >
                        ₺{Number(v.price).toLocaleString("tr-TR")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-4 flex items-center gap-2 text-xs font-bold">
            {isOutOfStock ? (
              <span className="text-rose-600">Tükendi</span>
            ) : selectedVariant.stock <= 5 ? (
              <span className="text-amber-600">Son {selectedVariant.stock} adet stokta!</span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700">
                <PackageCheck size={14} /> Stokta mevcut ({selectedVariant.stock} adet)
              </span>
            )}
          </div>

          {/* Quantity, Wishlist and Add To Cart */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-4">
            <div className="flex items-center justify-between rounded-lg border border-stone-300 bg-white px-3 py-2 sm:w-32">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="p-1 text-stone-600 hover:text-black disabled:opacity-40"
                aria-label="Azalt"
              >
                <Minus size={15} />
              </button>
              <span className="font-extrabold text-sm text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                disabled={isOutOfStock || quantity >= selectedVariant.stock}
                className="p-1 text-stone-600 hover:text-black disabled:opacity-40"
                aria-label="Artır"
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg transition-all ${
                added
                  ? "bg-emerald-700"
                  : isOutOfStock
                  ? "bg-stone-300 cursor-not-allowed"
                  : "bg-[#0e131a] border border-[#c5a880]/50 text-[#dfcca8] hover:bg-[#c5a880] hover:text-[#0e131a] hover:border-[#c5a880]"
              }`}
            >
              {added ? (
                <>
                  <Check size={18} /> Sepete Eklendi!
                </>
              ) : isOutOfStock ? (
                "Stokta Yok"
              ) : (
                <>
                  <ShoppingBag size={18} /> Sepete Ekle
                </>
              )}
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`flex items-center justify-center rounded-lg border px-4 py-4 transition-all ${
                favorited
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
              }`}
              title={favorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart size={20} className={favorited ? "fill-rose-500 text-rose-500" : ""} />
            </button>
          </div>

          {/* Benefits & Guarantees */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-200 pt-6 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck size={18} className="text-[#849649] shrink-0" />
              <div>
                <p className="font-bold text-stone-900">1500 TL Üzeri Ücretsiz</p>
                <p className="text-[11px] text-stone-500">Hızlı kargo gönderimi</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-[#849649] shrink-0" />
              <div>
                <p className="font-bold text-stone-900">Güvenli Ödeme</p>
                <p className="text-[11px] text-stone-500">256-Bit SSL koruması</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-[#849649] shrink-0" />
              <div>
                <p className="font-bold text-stone-900">Özel Sunum</p>
                <p className="text-[11px] text-stone-500">Kutulu özel ambalaj</p>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          {product.description && (
            <div className="mt-8 border-t border-stone-200 pt-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 mb-2">
                Koku Hikayesi & Detaylar
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="degerlendirmeler" className="border-t border-stone-200 bg-white px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#849649]">
                Gerçek Müşteri Deneyimleri
              </span>
              <h2 className="mt-1 text-3xl sm:text-4xl font-black text-stone-950">
                Müşteri Değerlendirmeleri
              </h2>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#101e2c] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-black transition-all"
            >
              <MessageSquarePlus size={16} />
              {showReviewForm ? "Formu Kapat" : "Değerlendirme Yaz"}
            </button>
          </div>

          {/* Score Card & Breakdown */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#fafaf9] p-8 rounded-2xl border border-stone-200">
            <div className="md:col-span-4 text-center md:text-left md:border-r md:border-stone-200 md:pr-8">
              <div className="text-6xl font-black text-stone-950 tracking-tight">
                {avgRating}
              </div>
              <div className="mt-2 flex items-center justify-center md:justify-start text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    className={
                      s <= Math.round(Number(avgRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-bold text-stone-500">
                {totalReviews} doğrulanmış değerlendirmeye göre
              </p>
            </div>

            <div className="md:col-span-8 flex flex-col gap-2">
              {ratingCounts.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-3 text-xs font-bold text-stone-600">
                  <span className="w-12">{star} Yıldız</span>
                  <div className="relative h-2.5 flex-1 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-stone-400 font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="mt-8 rounded-2xl border-2 border-stone-900 bg-white p-6 sm:p-8 shadow-lg transition-all"
            >
              <h3 className="text-xl font-black text-stone-900">
                Bu Ürünü Değerlendirin
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Kokunun kalıcılığı, ferahlığı ve ambalajı hakkındaki samimi düşüncelerinizi paylaşın.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-2">
                    Puanınız
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-amber-400 transition-transform hover:scale-125"
                      >
                        <Star
                          size={28}
                          className={
                            s <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-300"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-black text-stone-700">
                      {hoverRating || rating} / 5 Yıldız
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                      Adınız Soyadınız *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Örn. Ahmet Yılmaz"
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-medium text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                      Başlık (İsteğe Bağlı)
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Örn. Harika bir tazelik!"
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-medium text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                    Değerlendirmeniz *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Kokunun yayılımı ve hissi nasıldı? Deneyiminizi aktarın..."
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-medium text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="rounded-lg border border-stone-300 px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="rounded-lg bg-[#101e2c] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-black disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Gönderiliyor..." : "Yorumu Yayınla"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Review List */}
          <div className="mt-12 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-[#fafaf9] rounded-2xl border border-dashed border-stone-300">
                <p className="text-sm font-bold text-stone-600">
                  Bu ürün için henüz bir değerlendirme bulunmuyor.
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  İlk değerlendirmeyi yapan siz olun!
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl border border-stone-200 bg-[#fafaf9]/60 p-6 transition-all hover:bg-[#fafaf9]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101e2c] text-xs font-black text-white uppercase">
                        {rev.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-stone-900">
                            {rev.authorName}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            <BadgeCheck size={12} /> Doğrulanmış Alıcı
                          </span>
                        </div>
                        <div className="flex items-center text-amber-500 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={
                                s <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-stone-400 font-medium">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(rev.createdAt))}
                    </span>
                  </div>

                  {rev.title && (
                    <h4 className="mt-4 text-sm font-black text-stone-900">
                      {rev.title}
                    </h4>
                  )}
                  <p className="mt-1.5 text-xs text-stone-700 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* MOBİL YAPIŞKAN SATIN ALMA BARI (Mobil kullanıcılar için daima erişilebilir) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-black text-stone-900 truncate">
            {product.name}
          </span>
          <span className="text-[11px] text-[#8f7351] font-bold">
            {selectedVariant.name} · ₺{Number(selectedVariant.price).toLocaleString("tr-TR")}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
            added
              ? "bg-emerald-700 text-white"
              : isOutOfStock
              ? "bg-stone-300 text-stone-500 cursor-not-allowed"
              : "bg-[#0e131a] text-[#dfcca8] hover:bg-[#c5a880] hover:text-[#0e131a] shadow-md"
          }`}
        >
          {added ? (
            <>
              <Check size={14} /> Eklendi
            </>
          ) : isOutOfStock ? (
            "Tükendi"
          ) : (
            <>
              <ShoppingBag size={14} /> Sepete Ekle
            </>
          )}
        </button>
      </div>
    </>
  );
}
