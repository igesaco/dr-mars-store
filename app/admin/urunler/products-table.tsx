"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { bulkProductAction, updateProductSortOrder } from "./actions";
import { ArrowUpToLine, Percent, Layers, Check, Sparkles } from "lucide-react";

export type CatalogRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  sku: string | null;
  volumeMl: number | null;
  price: string | null;
  unitCost: string | null;
  stock: number | null;
  lowStockThreshold: number | null;
  sortOrder?: number | null;
  active: boolean;
  imageUrl: string | null;
};

const currency = (value: string | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(Number(value));

export default function ProductsTable({ rows }: { rows: CatalogRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [stockVal, setStockVal] = useState<string>("50");
  const [priceVal, setPriceVal] = useState<string>("15");
  const [isPending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.id));
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const handleQuickMoveToTop = (id: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", id);
      fd.append("sortOrder", "1");
      await updateProductSortOrder(fd);
    });
  };

  const handleUpdateSort = (id: string, currentSort: number) => {
    const val = prompt("Yeni vitrin sırasını girin (Örn: 1 en üst, 2, 3...):", String(currentSort || 0));
    if (val === null) return;
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", id);
      fd.append("sortOrder", String(num));
      await updateProductSortOrder(fd);
    });
  };

  return (
    <form action={bulkProductAction} className="catalog-table-form">
      {/* Gelişmiş Toplu İşlem Çubuğu */}
      <div
        className="catalog-bulkbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          backgroundColor: selected.length ? "#f0fdf4" : "#f8fafc",
          border: selected.length ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
          borderRadius: "12px",
          marginBottom: "16px",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: selected.length ? "#166534" : "#475569",
            }}
          >
            {selected.length
              ? `✓ ${selected.length} ürün seçildi`
              : "Toplu işlem uygulamak için ürün(leri) seçin:"}
          </span>
        </div>

        <select
          name="bulkAction"
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          <option value="" disabled>
            ⚡ Toplu İşlem Seçin...
          </option>
          <optgroup label="Stok İşlemleri">
            <option value="set_stock">📦 Stok Adedini Belirle (Hepsini X Yap)</option>
            <option value="add_stock">➕ Mevcut Stoğa Ekle (+X Adet)</option>
          </optgroup>
          <optgroup label="Fiyat ve Kâr Marjı">
            <option value="increase_price_percent">📈 Kâr Marjı / Fiyat Artışı (% Yüzde)</option>
            <option value="increase_price_amount">💵 Sabit Fiyat Artışı (+TL)</option>
            <option value="set_margin_from_cost">🏷️ Maliyetten Kâr Marjı Hesapla (Maliyet + %X)</option>
          </optgroup>
          <optgroup label="Vitrin ve Durum">
            <option value="move_to_top">⭐ Vitrinde En Üste Al (Sıra: 1)</option>
            <option value="activate">🟢 Yayına Al</option>
            <option value="archive">⚪ Arşivle (Taslağa Al)</option>
          </optgroup>
        </select>

        {/* Seçilen işleme özel dinamik girdi alanı */}
        {(bulkAction === "set_stock" || bulkAction === "add_stock") && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              name="bulkStockValue"
              type="number"
              min="0"
              value={stockVal}
              onChange={(e) => setStockVal(e.target.value)}
              placeholder="Adet"
              style={{
                width: "90px",
                padding: "7px 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            />
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>adet</span>
          </div>
        )}

        {(bulkAction === "increase_price_percent" || bulkAction === "set_margin_from_cost") && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              name="bulkPriceValue"
              type="number"
              step="1"
              value={priceVal}
              onChange={(e) => setPriceVal(e.target.value)}
              placeholder="%"
              style={{
                width: "80px",
                padding: "7px 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            />
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>% kâr/artış</span>
          </div>
        )}

        {bulkAction === "increase_price_amount" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              name="bulkPriceValue"
              type="number"
              step="5"
              defaultValue="50"
              placeholder="TL"
              style={{
                width: "90px",
                padding: "7px 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            />
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>TL ekle</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!selected.length || !bulkAction || isPending}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            backgroundColor: selected.length && bulkAction ? "#0f172a" : "#94a3b8",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: selected.length && bulkAction ? "pointer" : "not-allowed",
            border: "none",
            transition: "background-color 0.2s",
          }}
        >
          {isPending ? "İşleniyor..." : "Uygula"}
        </button>
      </div>

      <div className="catalog-table">
        <div className="catalog-row catalog-head">
          <label className="catalog-check">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label="Tüm ürünleri seç"
            />
          </label>
          <span style={{ minWidth: "60px" }}>SIRA</span>
          <span>ÜRÜN</span>
          <span>KATEGORİ</span>
          <span>STOK</span>
          <span>FİYAT</span>
          <span>DURUM</span>
          <span style={{ textAlign: "right" }}>İŞLEM</span>
        </div>

        {rows.map((row) => (
          <div className="catalog-row" key={row.id}>
            <label className="catalog-check">
              <input
                type="checkbox"
                name="productIds"
                value={row.id}
                checked={selectedSet.has(row.id)}
                onChange={() => toggle(row.id)}
                aria-label={`${row.name} ürününü seç`}
              />
            </label>

            {/* Vitrin Sırası & Hızlı En Üste Alma */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "60px" }}>
              <button
                type="button"
                onClick={() => handleUpdateSort(row.id, row.sortOrder ?? 0)}
                title="Sıralamayı değiştir (Örn: 1 en üst, 2, 3... veya 0 ile sırasız)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "30px",
                  height: "26px",
                  padding: "0 6px",
                  borderRadius: "6px",
                  backgroundColor: row.sortOrder === 1 ? "#fef3c7" : row.sortOrder && row.sortOrder > 1 ? "#eff6ff" : "#f1f5f9",
                  color: row.sortOrder === 1 ? "#92400e" : row.sortOrder && row.sortOrder > 1 ? "#1e40af" : "#64748b",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  border: row.sortOrder === 1 ? "1px solid #fde68a" : row.sortOrder && row.sortOrder > 1 ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                {row.sortOrder && row.sortOrder > 0 ? `#${row.sortOrder}` : "—"}
              </button>

              <button
                type="button"
                onClick={() => handleQuickMoveToTop(row.id)}
                title="En Üste (1. Sıraya) Taşı"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "5px",
                  backgroundColor: "#fff",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                <ArrowUpToLine size={12} />
              </button>
            </div>

            <span className="catalog-product">
              <i>
                {row.imageUrl ? (
                  <img src={row.imageUrl} alt="" />
                ) : (
                  row.name.slice(0, 2).toUpperCase()
                )}
              </i>
              <span>
                <b>{row.name}</b>
                <small>
                  {row.sku ?? "SKU yok"} · {row.volumeMl ?? "—"} ML
                </small>
              </span>
            </span>

            <span>{row.category ?? "Kategorisiz"}</span>

            <span
              className={
                (row.stock ?? 0) <= (row.lowStockThreshold ?? 5)
                  ? "catalog-stock-low"
                  : ""
              }
            >
              {row.stock ?? 0} adet
            </span>

            <span>{currency(row.price)}</span>

            <span>
              <em className={row.active ? "catalog-status active" : "catalog-status"}>
                {row.active ? "Yayında" : "Taslak"}
              </em>
            </span>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
              <Link className="catalog-edit" href={`/admin/urunler/${row.id}`}>
                Düzenle
              </Link>
            </div>
          </div>
        ))}

        {!rows.length && (
          <div className="catalog-empty">Filtrelere uygun ürün bulunamadı.</div>
        )}
      </div>
    </form>
  );
}
