import { Suspense } from "react";
import CategoryClient from "./CategoryClient";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // Await the params Promise for Next.js 15
  const unwrappedParams = await params;
  const categorySlug = unwrappedParams.category;

  // Fetch products on the server! No more client-side useEffect bugs.
  const products = await prisma.product.findMany({
    where: { category: { slug: categorySlug } },
    include: { category: { select: { name: true, slug: true } } },
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
  }));

  return (
    <Suspense fallback={<div style={{ padding: "100px 40px", textAlign: "center", color: "var(--gray-500)", fontSize: 16 }}>Loading Category...</div>}>
      <CategoryClient categorySlug={categorySlug} initialProducts={mappedProducts} />
    </Suspense>
  );
}
