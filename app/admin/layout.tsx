import "./admin.css";
import "./sections.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Box,
  LayoutTemplate,
  Megaphone,
  MessageSquare,
  Package,
  PlusSquare,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  Tags,
  Users,
  ShieldAlert,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { getCurrentAdmin, isAdmin } from "@/lib/admin-auth";
import { logoutAction } from "@/app/yonetici-giris/actions";

const groups = [
  {
    title: "SATIŞ & SİPARİŞ",
    links: [
      ["Genel bakış", "/admin", BarChart3],
      ["Siparişler", "/admin/siparisler", Package],
      ["Kuponlar", "/admin/kuponlar", Tag],
      ["Müşteriler", "/admin/musteriler", Users],
    ],
  },
  {
    title: "KATALOG",
    links: [
      ["Ürünler", "/admin/urunler", Box],
      ["Vitrin Sıralaması", "/admin/urunler/vitrin", Sparkles],
      ["Yeni ürün", "/admin/urunler/yeni", PlusSquare],
      ["Kategoriler", "/admin/kategoriler", Tags],
      ["Yorumlar", "/admin/yorumlar", MessageSquare],
    ],
  },
  {
    title: "PAZARLAMA & REKLAM",
    links: [
      ["Reklam Yönetimi", "/admin/reklamlar", Megaphone],
      ["SEO & analiz", "/admin/seo", Search],
    ],
  },
  {
    title: "YÖNETİM & GÜVENLİK",
    links: [
      ["İşlem & Güvenlik Logları", "/admin/loglar", ShieldAlert],
      ["Personel Hesapları", "/admin/personel", UserCheck],
      ["E-ticaret genel", "/admin/e-ticaret", ShoppingBag],
      ["Site ayarları", "/admin/ayarlar", Settings],
      ["Web tasarımı", "/admin/tasarim", LayoutTemplate],
    ],
  },
] as const;

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) redirect("/yonetici-giris");
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/">
          <span>DR</span>
          <i />
          <span>MARS</span>
        </Link>
        <div style={{ margin: "-20px 12px 24px", padding: "10px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentAdmin.name}
          </p>
          <span style={{
            display: "inline-block",
            fontSize: "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: 4,
            padding: "2px 6px",
            borderRadius: 4,
            background: currentAdmin.isSuperAdmin ? "#caff73" : "#3b82f6",
            color: currentAdmin.isSuperAdmin ? "#101e2c" : "#fff",
          }}>
            {currentAdmin.isSuperAdmin ? "★ ADMİN" : "PERSONEL"}
          </span>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="admin-store-label">{group.title}</p>
            <nav className="admin-nav">
              {group.links.map(([label, path, Icon]) => (
                <Link href={path} key={path}>
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
        <div className="admin-help">
          <Link href="/">Mağazayı görüntüle ↗</Link>
          <form action={logoutAction}>
            <button type="submit">Güvenli çıkış</button>
          </form>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
