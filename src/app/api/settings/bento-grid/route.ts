import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULTS = [
  {
    id: "block1",
    badge: "🔥 Trending Product",
    title: "Cozy & Stylish",
    titleHighlight: "Night Suits",
    subtitle: "Premium soft fabric, trendy prints for women & kids starting from Rs. 1,450.",
    buttonText: "Shop Now",
    buttonLink: "/shop/night-suits",
    bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)",
    accentColor: "var(--red)",
    image: "/images/mashallah-store/women-suit-01.webp",
    type: "main"
  },
  {
    id: "block2",
    title: "Wireless\nEarbuds",
    subtitle: "Deep Bass & ENC Audio",
    buttonText: "Explore",
    buttonLink: "/shop/tws-wireless-earbuds",
    bg: "#e0f2fe",
    accentColor: "#0ea5e9",
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783374081/dastiyabstore/pjvunzav56ikyo9irgwy.webp",
    type: "wide"
  },
  {
    id: "block3",
    title: "Gift Sets",
    subtitle: "Special Hampers",
    buttonText: "View Gifts",
    buttonLink: "/shop/gift-box",
    bg: "#fff0f0",
    accentColor: "var(--red)",
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1783362758/dastiyabstore/emmpbbnxjfinlzuhw3wb.webp",
    type: "small"
  },
  {
    id: "block4",
    title: "Night Lights",
    subtitle: "Cute LED Lamps",
    buttonText: "Explore",
    buttonLink: "/product/panda-led-night-light-silicone",
    bg: "#f0fdf4",
    accentColor: "#16a34a",
    image: "https://res.cloudinary.com/zpbci6tf/image/upload/v1784753546/dastiyabstore/dkzttylp7r5ebphii2ui.webp",
    type: "small"
  },
  {
    id: "block5",
    title: "Explore All\nCategories",
    subtitle: "Find everything you need in one place.",
    buttonText: "Browse Catalog",
    buttonLink: "/shop",
    bg: "linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)",
    accentColor: "#8b5cf6",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    type: "wide"
  }
];

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'bento_grid' }
    });

    if (setting) {
      return NextResponse.json(setting.value);
    }

    return NextResponse.json(DEFAULTS);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(DEFAULTS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length !== 5) {
      return NextResponse.json({ error: 'Invalid payload: expected array of 5 blocks' }, { status: 400 });
    }

    const setting = await prisma.storeSetting.upsert({
      where: { key: 'bento_grid' },
      update: { value: body },
      create: { key: 'bento_grid', value: body }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save bento grid' }, { status: 500 });
  }
}
