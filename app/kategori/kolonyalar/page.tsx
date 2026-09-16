import CategoryPage, { generateMetadata as baseMetadata } from "../[slug]/page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return baseMetadata({ params: Promise.resolve({ slug: "kolonyalar" }) });
}

export default async function KolonyalarPage() {
  return CategoryPage({ params: Promise.resolve({ slug: "kolonyalar" }) });
}
