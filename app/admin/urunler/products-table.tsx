"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { bulkProductAction } from "./actions";

export type CatalogRow = {
  id: string; name: string; slug: string; category: string | null; sku: string | null;
  volumeMl: number | null; price: string | null; unitCost: string | null;
  stock: number | null; lowStockThreshold: number | null; active: boolean; imageUrl: string | null;
};

const currency = (value: string | null) => value === null ? "—" : new Intl.NumberFormat("tr-TR", {
  style: "currency", currency: "TRY",
}).format(Number(value));

export default function ProductsTable({ rows }: { rows: CatalogRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const toggleAll = () => setSelected(allSelected ? [] : rows.map(row => row.id));
  const toggle = (id: string) => setSelected(current =>
    current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  return <form action={bulkProductAction} className="catalog-table-form">
    <div className="catalog-bulkbar">
      <span>{selected.length ? `${selected.length} ürün seçildi` : "Toplu işlem için ürün seç"}</span>
      <select name="bulkAction" defaultValue="">
        <option value="" disabled>Toplu işlem seç</option>
        <option value="activate">Yayına al</option>
        <option value="archive">Arşivle</option>
      </select>
      <button type="submit" disabled={!selected.length}>Uygula</button>
    </div>
    <div className="catalog-table">
      <div className="catalog-row catalog-head">
        <label className="catalog-check"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Tüm ürünleri seç" /></label>
        <span>ÜRÜN</span><span>KATEGORİ</span><span>STOK</span><span>FİYAT</span><span>DURUM</span><span />
      </div>
      {rows.map(row => <div className="catalog-row" key={row.id}>
        <label className="catalog-check"><input type="checkbox" name="productIds" value={row.id}
          checked={selectedSet.has(row.id)} onChange={() => toggle(row.id)} aria-label={`${row.name} ürününü seç`} /></label>
        <span className="catalog-product">
          <i>{row.imageUrl ? <img src={row.imageUrl} alt="" /> : row.name.slice(0, 2).toUpperCase()}</i>
          <span><b>{row.name}</b><small>{row.sku ?? "SKU yok"} · {row.volumeMl ?? "—"} ML</small></span>
        </span>
        <span>{row.category ?? "Kategorisiz"}</span>
        <span className={(row.stock ?? 0) <= (row.lowStockThreshold ?? 5) ? "catalog-stock-low" : ""}>
          {row.stock ?? 0} adet
        </span>
        <span>{currency(row.price)}</span>
        <span><em className={row.active ? "catalog-status active" : "catalog-status"}>{row.active ? "Yayında" : "Taslak"}</em></span>
        <Link className="catalog-edit" href={`/admin/urunler/${row.id}`}>Düzenle</Link>
      </div>)}
      {!rows.length && <div className="catalog-empty">Filtrelere uygun ürün bulunamadı.</div>}
    </div>
  </form>;
}
