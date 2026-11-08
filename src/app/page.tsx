import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';
import { DEFAULT_HERO_SLIDES, DEFAULT_PROMO_BANNER } from '@/data/defaultBanners';

import { preload } from 'react-dom';

export const revalidate = 3600;

export default async function HomePage() {
  let initialData: any = {};

  try {
    const results = await Promise.allSettled([
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
    
    const featured = results[0].status === 'fulfilled' ? results[0].value : [];
    const bestSellers = results[1].status === 'fulfilled' ? results[1].value : [];
    const categories = results[2].status === 'fulfilled' ? results[2].value : [];
    const instagram = results[3].status === 'fulfilled' ? results[3].value : [];
    const bannerSetting = results[4].status === 'fulfilled' ? results[4].value : null;
    const promoSetting = results[5].status === 'fulfilled' ? results[5].value : null;
    const bentoSetting = results[6].status === 'fulfilled' ? results[6].value : null;
    const statsSetting = results[7].status === 'fulfilled' ? results[7].value : null;
    const siteReviewsSetting = results[8].status === 'fulfilled' ? results[8].value : null;
    const bundles = results[9].status === 'fulfilled' ? results[9].value : [];

    // Safely parse JSON values if stored as string
    const parseValue = (val: any) => {
      if (!val) return null;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    let bannerSlides = bannerSetting ? parseValue(bannerSetting.value) : null;
    if (!bannerSlides || !Array.isArray(bannerSlides) || bannerSlides.length === 0) {
      bannerSlides = DEFAULT_HERO_SLIDES;
    }

    let promoBanner = promoSetting ? parseValue(promoSetting.value) : null;
    if (!promoBanner) {
      promoBanner = DEFAULT_PROMO_BANNER;
    }

    const bentoGrid = bentoSetting ? parseValue(bentoSetting.value) : null;
    const statsStrip = statsSetting ? parseValue(statsSetting.value) : null;
    const siteReviews = siteReviewsSetting ? parseValue(siteReviewsSetting.value) : null;

    // Preload the first hero image for LCP optimization
    const firstBannerImage = (Array.isArray(bannerSlides) && bannerSlides.length > 0 && bannerSlides[0]?.image)
      ? bannerSlides[0].image
      : DEFAULT_HERO_SLIDES[0].image;
    
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
    initialData = {
      bannerSlides: DEFAULT_HERO_SLIDES,
      promoBanner: DEFAULT_PROMO_BANNER
    };
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
