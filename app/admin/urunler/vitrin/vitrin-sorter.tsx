"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpToLine,
  Check,
  ExternalLink,
  GripVertical,
  Loader2,
  Save,
  Sparkles,
  Star,
} from "lucide-react";
import { saveProductOrderList, toggleProductFeatured } from "../actions";

export type VitrinItem = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isFeatured: boolean;
  categoryName: string;
  imageUrl: string | null;
  price: string | null;
};

export default function VitrinSorter({ initialItems }: { initialItems: VitrinItem[] }) {
  const [items, setItems] = useState<VitrinItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Otomatik / Manuel Kaydetme
  const persistOrder = (newItems: VitrinItem[]) => {
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        const ids = newItems.map((item) => item.id);
        await saveProductOrderList(ids);
        setSaveStatus("saved");
        setStatusMessage("Sıralama başarıyla kaydedildi! Anasayfa vitrini anında güncellendi.");
        setTimeout(() => {
          setSaveStatus("idle");
          setStatusMessage("");
        }, 4000);
      } catch (error) {
        setSaveStatus("error");
        setStatusMessage("Sıralama kaydedilirken bir hata oluştu: " + String(error));
      }
    });
  };

  // Bir yukarı taşı
  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...items];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setItems(next);
    persistOrder(next);
  };

  // Bir aşağı taşı
  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setItems(next);
    persistOrder(next);
  };

  // En başa (1. Sıraya) al
  const moveToTop = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const [target] = next.splice(index, 1);
    next.unshift(target);
    setItems(next);
    persistOrder(next);
  };

  // Belirli bir sıraya taşı (örn: 1'den items.length'e kadar)
  const moveToPosition = (currentIndex: number, targetPos: number) => {
    const targetIndex = targetPos - 1;
    if (
      isNaN(targetIndex) ||
      targetIndex < 0 ||
      targetIndex >= items.length ||
      targetIndex === currentIndex
    ) {
      return;
    }
    const next = [...items];
    const [target] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, target);
    setItems(next);
    persistOrder(next);
  };

  // Öne çıkarılan durumunu aç/kapat
  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    const updated = !currentFeatured;
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isFeatured: updated } : it))
    );
    startTransition(async () => {
      try {
        await toggleProductFeatured({ id, isFeatured: updated });
        setStatusMessage(
          updated
            ? "Ürün öne çıkanlar (En Çok Satanlar) vitrinine eklendi."
            : "Ürün öne çıkanlar vitrininden çıkarıldı."
        );
        setTimeout(() => setStatusMessage(""), 3500);
      } catch (err) {
        setStatusMessage("Hata: " + String(err));
      }
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, moved);
    setItems(next);
    setDraggedIndex(null);
    persistOrder(next);
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Bilgilendirme ve Hızlı İşlem Paneli */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          padding: "16px 20px",
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "grid", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "#fef3c7",
                color: "#92400e",
              }}
            >
              <Sparkles size={14} />
            </span>
            <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
              Canlı Vitrin Sıralaması ({items.length} Ürün)
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
            Ürünleri sürükleyerek veya oklarla taşıyın. Yaptığınız sıralama otomatik olarak kaydedilir
            ve sitede 1. kutudan itibaren anında görünür.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => persistOrder(items)}
            disabled={isPending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 18px",
              borderRadius: "9px",
              backgroundColor: saveStatus === "saved" ? "#16a34a" : "#0f172a",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.85rem",
              border: "none",
              cursor: isPending ? "wait" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Kaydediliyor...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check size={16} />
                Kaydedildi!
              </>
            ) : (
              <>
                <Save size={16} />
                Sıralamayı Onayla
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bildirim / Toast Bar */}
      {statusMessage && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            backgroundColor: saveStatus === "error" ? "#fef2f2" : "#f0fdf4",
            border: saveStatus === "error" ? "1px solid #fecaca" : "1px solid #bbf7d0",
            color: saveStatus === "error" ? "#991b1b" : "#166534",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {saveStatus === "error" ? "⚠️" : "✓"} {statusMessage}
        </div>
      )}

      {/* Sıralı Ürün Listesi */}
      <div style={{ display: "grid", gap: "10px" }}>
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          let badgeColor = "#475569";
          let badgeBg = "#f1f5f9";
          let badgeBorder = "#e2e8f0";
          let badgeText = `#${index + 1}`;

          if (isFirst) {
            badgeColor = "#92400e";
            badgeBg = "#fef3c7";
            badgeBorder = "#fde68a";
            badgeText = "👑 1. SIRA (VİTRİN BAŞI)";
          } else if (isSecond) {
            badgeColor = "#334155";
            badgeBg = "#e2e8f0";
            badgeBorder = "#cbd5e1";
            badgeText = "🥈 2. SIRA";
          } else if (isThird) {
            badgeColor = "#78350f";
            badgeBg = "#ffedd5";
            badgeBorder = "#fed7aa";
            badgeText = "🥉 3. SIRA";
          }

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              style={{
                display: "grid",
                gridTemplateColumns: "36px minmax(130px, 190px) 60px minmax(0, 1fr) auto auto",
                alignItems: "center",
                gap: "14px",
                padding: "12px 18px",
                backgroundColor: isFirst ? "#fffdf5" : "#ffffff",
                border: isFirst ? "2px solid #fde68a" : "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: isFirst
                  ? "0 4px 12px rgba(245, 158, 11, 0.08)"
                  : "0 1px 2px rgba(0,0,0,0.03)",
                opacity: draggedIndex === index ? 0.4 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {/* Tutamaç (Drag Handle) */}
              <div
                title="Sürükleyip bırakarak taşıyabilirsiniz"
                style={{
                  cursor: "grab",
                  display: "grid",
                  placeItems: "center",
                  color: "#94a3b8",
                }}
              >
                <GripVertical size={20} />
              </div>

              {/* Sıra Rozeti */}
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: badgeBg,
                    color: badgeColor,
                    border: `1px solid ${badgeBorder}`,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {badgeText}
                </span>
              </div>

              {/* Ürün Görseli */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      color: "#94a3b8",
                      fontSize: "0.7rem",
                    }}
                  >
                    Foto yok
                  </div>
                )}
              </div>

              {/* Ürün Bilgisi */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Link
                    href={`/admin/urunler/${item.id}`}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      textDecoration: "none",
                    }}
                  >
                    {item.name}
                  </Link>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                    }}
                  >
                    {item.categoryName}
                  </span>
                  {item.price && (
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534" }}>
                      {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
                        Number(item.price)
                      )}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                    title="Öne çıkanlar durumunu değiştir"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: item.isFeatured ? "#ecfdf5" : "#f8fafc",
                      color: item.isFeatured ? "#065f46" : "#64748b",
                      border: item.isFeatured ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                      cursor: "pointer",
                    }}
                  >
                    <Star
                      size={12}
                      className={item.isFeatured ? "fill-current text-amber-500" : "text-stone-400"}
                    />
                    {item.isFeatured ? "Öne Çıkan (Vitrin Aktif)" : "Normal Ürün (Vitrinde Değil)"}
                  </button>

                  <a
                    href={`/urun/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "0.72rem",
                      color: "#64748b",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      textDecoration: "none",
                    }}
                  >
                    Sayfayı Gör <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Doğrudan Sıra Değiştirme Kutusu */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Sıra:</span>
                <input
                  type="number"
                  min="1"
                  max={items.length}
                  value={index + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) moveToPosition(index, val);
                  }}
                  style={{
                    width: "48px",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    textAlign: "center",
                    backgroundColor: "#fff",
                  }}
                  title="İstediğiniz sıra numarasını doğrudan yazabilirsiniz"
                />
              </div>

              {/* Aksiyon Butonları (En Başa Al, Yukarı, Aşağı) */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {!isFirst && (
                  <button
                    type="button"
                    onClick={() => moveToTop(index)}
                    title="1. Sıraya Taşı (En Başa Al)"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 10px",
                      borderRadius: "7px",
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <ArrowUpToLine size={13} />
                    1. Sıra Yap
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={isFirst}
                  title="Bir yukarı taşı"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "7px",
                    backgroundColor: "#fff",
                    border: "1px solid #cbd5e1",
                    color: isFirst ? "#cbd5e1" : "#1e293b",
                    cursor: isFirst ? "not-allowed" : "pointer",
                  }}
                >
                  <ArrowUp size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === items.length - 1}
                  title="Bir aşağı taşı"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "7px",
                    backgroundColor: "#fff",
                    border: "1px solid #cbd5e1",
                    color: index === items.length - 1 ? "#cbd5e1" : "#1e293b",
                    cursor: index === items.length - 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ArrowDown size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
