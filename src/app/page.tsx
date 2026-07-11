import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

export const revalidate = 3600;

export default async function HomePage() {
  let initialData = {};

  try {
    const featured = await prisma.product.findMany({ where: { is_featured: true } });
    const bestSellers = await prisma.product.findMany({ where: { is_best_seller: true } });
    const categories = await prisma.category.findMany({ 
      where: { is_in_sidebar: true },
      orderBy: { created_at: 'asc' } 
    });
    const instagram = await prisma.instagramPost.findMany({ 
      orderBy: { created_at: 'desc' } 
    });
    
    const bannerSetting = await prisma.storeSetting.findUnique({
      where: { key: 'home_banner_slides' }
    });
    const bannerSlides = bannerSetting ? bannerSetting.value : null;

    const promoSetting = await prisma.storeSetting.findUnique({
      where: { key: 'promo_banner' }
    });
    const promoBanner = promoSetting ? (typeof promoSetting.value === 'string' ? JSON.parse(promoSetting.value) : promoSetting.value) : null;

    const bentoSetting = await prisma.storeSetting.findUnique({
      where: { key: 'bento_grid' }
    });
    const bentoGrid = bentoSetting ? bentoSetting.value : null;

    const statsSetting = await prisma.storeSetting.findUnique({
      where: { key: 'stats_strip' }
    });
    const statsStrip = statsSetting ? statsSetting.value : null;

    const siteReviewsSetting = await prisma.storeSetting.findUnique({
      where: { key: 'site_reviews' }
    });
    const siteReviews = siteReviewsSetting ? siteReviewsSetting.value : null;

    initialData = { featured, bestSellers, categories, instagram, bannerSlides, promoBanner, bentoGrid, statsStrip, siteReviews };
  } catch (error) {
    console.error('Error fetching homepage data on server:', error);
  }

  return <HomeClient initialData={initialData} />;
}
