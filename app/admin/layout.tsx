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
} from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
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
    title: "YÖNETİM & AYARLAR",
    links: [
      ["E-ticaret genel", "/admin/e-ticaret", ShoppingBag],
      ["Site ayarları", "/admin/ayarlar", Settings],
      ["Web tasarımı", "/admin/tasarim", LayoutTemplate],
    ],
  },
] as const;

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdmin())) redirect("/yonetici-giris");
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/">
          <span>DR</span>
          <i />
          <span>MARS</span>
        </Link>
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
