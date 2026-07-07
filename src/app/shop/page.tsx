import { prisma } from '@/lib/prisma';
import ShopClient from '@/components/ShopClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  let products: any[] = [];
  try {
    const rawProducts = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    products = rawProducts.map((p: any) => ({
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
      description: p.description || "",
      specs: p.specs,
      features: p.features,
      isFeatured: p.is_featured,
      isBestSeller: p.is_best_seller,
    }));
  } catch (err) {
    console.error("Error fetching products on server:", err);
  }

  return <ShopClient initialProducts={products} />;
}
