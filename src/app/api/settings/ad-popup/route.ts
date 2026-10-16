import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_POPUP_CONFIG = {
  enabled: true,
  badge: "🔥 LIMITED TIME OFFER",
  title: "Flat 10% OFF on Your Order!",
  subtitle: "Explore our brand new 2-Piece Night Suits & Loungewear collection starting from just Rs. 1,450. Cash on delivery nationwide!",
  couponCode: "WELCOME10",
  discountText: "Extra 10% OFF at Checkout",
  buttonText: "Shop Night Suits Collection →",
  buttonLink: "/shop/night-suits",
  image: "/images/mashallah-store/women-suit-01.webp",
  secondaryImage: "/images/mashallah-store/kids-suit-01.webp"
};

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'home_ad_popup' }
    });

    if (setting && setting.value) {
      let data = setting.value;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      const parsedData = (typeof data === 'object' && data !== null && !Array.isArray(data)) ? (data as Record<string, any>) : {};
      return NextResponse.json({ ...DEFAULT_POPUP_CONFIG, ...parsedData });
    }

    return NextResponse.json(DEFAULT_POPUP_CONFIG);
  } catch (error: any) {
    console.error('API Error in ad-popup GET:', error);
    return NextResponse.json(DEFAULT_POPUP_CONFIG);
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
