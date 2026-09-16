import ProductPage, { generateMetadata as baseMetadata } from "../[slug]/page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return baseMetadata({ params: Promise.resolve({ slug: "citrus-no-01" }) });
}

export default async function CitrusPage() {
  return ProductPage({ params: Promise.resolve({ slug: "citrus-no-01" }) });
}
