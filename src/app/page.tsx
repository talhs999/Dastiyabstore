import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

import { preload } from 'react-dom';

export const revalidate = 3600;

export default async function HomePage() {
  let initialData = {};

  try {
    const [
      featured,
      bestSellers,
      categories,
      instagram,
      bannerSetting,
      promoSetting,
      bentoSetting,
      statsSetting,
      siteReviewsSetting,
      bundles
    ] = await Promise.all([
      prisma.product.findMany({ 
        where: { is_featured: true },
        include: { store: { select: { id: true, name: true, slug: true } } }
      }),
      prisma.product.findMany({ 
        where: { is_best_seller: true },
        include: { store: { select: { id: true, name: true, slug: true } } }
      }),
      prisma.category.findMany({ 
        where: { is_in_sidebar: true },
        orderBy: { created_at: 'asc' } 
      }),
      prisma.instagramPost.findMany({ 
        orderBy: { created_at: 'desc' } 
      }),
      prisma.storeSetting.findUnique({ where: { key: 'home_banner_slides' } }),
      prisma.storeSetting.findUnique({ where: { key: 'promo_banner' } }),
      prisma.storeSetting.findUnique({ where: { key: 'bento_grid' } }),
      prisma.storeSetting.findUnique({ where: { key: 'stats_strip' } }),
      prisma.storeSetting.findUnique({ where: { key: 'site_reviews' } }),
      prisma.product.findMany({ where: { is_bundle: true } })
    ]);
    
    const bannerSlides = bannerSetting ? bannerSetting.value : null;
    const promoBanner = promoSetting ? (typeof promoSetting.value === 'string' ? JSON.parse(promoSetting.value as string) : promoSetting.value) : null;
    const bentoGrid = bentoSetting ? bentoSetting.value : null;
    const statsStrip = statsSetting ? statsSetting.value : null;
    const siteReviews = siteReviewsSetting ? siteReviewsSetting.value : null;

    // Preload the first hero image for LCP optimization
    const firstBannerImage = (bannerSlides && Array.isArray(bannerSlides) && bannerSlides.length > 0)
      ? (bannerSlides as any)[0].image
      : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80";
    
    if (firstBannerImage) {
      preload(firstBannerImage, { as: 'image', fetchPriority: 'high' });
    }

    // Helper to randomize product arrays
    const shuffleArray = (array: any[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    initialData = { 
      featured: shuffleArray(featured), 
      bestSellers: shuffleArray(bestSellers), 
      categories, 
      instagram, 
      bannerSlides, 
      promoBanner, 
      bentoGrid, 
      statsStrip, 
      siteReviews, 
      bundles 
    };
  } catch (error) {
    console.error('Error fetching homepage data on server:', error);
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Dastiyab Store",
    "url": "https://dastiyabstore.com",
    "logo": "https://dastiyabstore.com/logo.png",
    "sameAs": [
      "https://www.facebook.com/DastiyabStore/",
      "https://www.instagram.com/dastiyabstore"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <h1 className="sr-only">DastiyabStore - Pakistan's Premium Online Store</h1>
      <HomeClient initialData={initialData} />
    </>
  );
}
