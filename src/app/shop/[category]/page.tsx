import { Suspense } from "react";
import type { Metadata } from "next";
import CategoryClient from "./CategoryClient";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  let category: any = null;
  try {
    category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { name: true, slug: true }
    });
  } catch (e) {}

  const catName = category ? category.name : categorySlug.replace(/-/g, ' ');
  const capitalized = catName.charAt(0).toUpperCase() + catName.slice(1);
  const title = `${capitalized} — Buy Online in Pakistan | DastiyabStore`;
  const description = `Shop high quality ${capitalized} on DastiyabStore. Cash on Delivery, easy returns, and fast delivery nationwide in Pakistan.`;
  const url = `https://dastiyabstore.com/shop/${categorySlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "DastiyabStore",
      type: "website",
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // Await the params Promise for Next.js 15
  const unwrappedParams = await params;
  const categorySlug = unwrappedParams.category;

  // Fetch products on the server! No more client-side useEffect bugs.
  const products = await prisma.product.findMany({
    where: { category: { slug: categorySlug } },
    include: { 
      category: { select: { name: true, slug: true } },
      store: { select: { id: true, name: true, slug: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  // Map to the format expected by the client
  const mappedProducts = products.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    image: p.image,
    images: p.images,
    rating: Number(p.rating || 0),
    reviews: Number(p.reviews || 0),
    badge: p.badge,
    badgeType: p.badge_type,
    isNew: p.is_new,
    inStock: p.in_stock !== undefined ? p.in_stock : true,
    stock_quantity: p.stock_quantity,
    category: p.category?.name || "",
    categorySlug: p.category?.slug || "",
    description: p.description || "",
    specs: p.specs,
    features: p.features,
    isFeatured: p.is_featured,
    isBestSeller: p.is_best_seller,
    createdAt: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
    store: p.store ? { id: p.store.id, name: p.store.name, slug: p.store.slug } : null,
  }));

  // Shuffle array for "Recommended" default sort
  for (let i = mappedProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mappedProducts[i], mappedProducts[j]] = [mappedProducts[j], mappedProducts[i]];
  }

  return (
    <Suspense fallback={<div style={{ padding: "100px 40px", textAlign: "center", color: "var(--gray-500)", fontSize: 16 }}>Loading Category...</div>}>
      <CategoryClient categorySlug={categorySlug} initialProducts={mappedProducts} />
    </Suspense>
  );
}
