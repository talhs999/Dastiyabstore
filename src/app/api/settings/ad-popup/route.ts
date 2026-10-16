import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'home_ad_popup' }
    });

    let config: any = {};
    if (setting && setting.value) {
      let data = setting.value;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        config = data;
      }
    }

    if (config.enabled === false) {
      return NextResponse.json({ enabled: false, products: [] });
    }

    // Fetch products belonging STRICTLY to Dastiyab Store (store_id: null, in_stock: true)
    const count = await prisma.product.count({
      where: { store_id: null, in_stock: true }
    });

    let products: any[] = [];
    if (count > 0) {
      // Fetch up to 15 products with a random skip to achieve maximum diversity
      const takeCount = Math.min(count, 15);
      const maxSkip = Math.max(0, count - takeCount);
      const randomSkip = Math.floor(Math.random() * (maxSkip + 1));

      const rawProducts = await prisma.product.findMany({
        where: { store_id: null, in_stock: true },
        skip: randomSkip,
        take: takeCount,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          original_price: true,
          image: true,
          images: true,
          badge: true,
          category: {
            select: { name: true }
          }
        }
      });

      // Map and extract clean image previews
      products = rawProducts.map(p => {
        let secImg: string | null = null;
        if (Array.isArray(p.images) && p.images.length > 0) {
          secImg = String(p.images[0]);
        } else if (typeof p.images === 'string') {
          try {
            const parsed = JSON.parse(p.images);
            if (Array.isArray(parsed) && parsed.length > 0) secImg = String(parsed[0]);
          } catch (e) {}
        }

        let calculatedBadge = p.badge;
        if (!calculatedBadge && p.original_price && p.original_price > p.price) {
          const discountPc = Math.round(((p.original_price - p.price) / p.original_price) * 100);
          calculatedBadge = `${discountPc}% OFF`;
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          original_price: p.original_price,
          image: p.image,
          secondaryImage: secImg && secImg !== p.image ? secImg : null,
          badge: calculatedBadge || "EXCLUSIVE",
          categoryName: p.category?.name || "Official Dastiyab Store"
        };
      });

      // Randomize the order (Fisher-Yates)
      for (let i = products.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [products[i], products[j]] = [products[j], products[i]];
      }
    }

    return NextResponse.json({
      enabled: config.enabled ?? true,
      badge: config.badge || "🔥 DASTIYAB EXCLUSIVE DEAL",
      couponCode: config.couponCode || "WELCOME10",
      discountText: config.discountText || "Flat 10% Extra Discount at Checkout",
      products: products
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error('API Error in ad-popup GET:', error);
    return NextResponse.json({
      enabled: true,
      badge: "🔥 DASTIYAB EXCLUSIVE DEAL",
      couponCode: "WELCOME10",
      discountText: "Flat 10% Extra Discount at Checkout",
      products: []
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const setting = await prisma.storeSetting.upsert({
      where: { key: 'home_ad_popup' },
      update: { value: JSON.stringify(data) },
      create: {
        key: 'home_ad_popup',
        value: JSON.stringify(data)
      }
    });

    return NextResponse.json(setting);
  } catch (error: any) {
    console.error('API Error in ad-popup POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
