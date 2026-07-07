import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    return NextResponse.json({ featured, bestSellers, categories, instagram, bannerSlides, promoBanner, bentoGrid, statsStrip, siteReviews });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
