import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULTS = [
  {
    id: "block1",
    badge: "Season's Hot Product",
    title: "Stay Cool with",
    titleHighlight: "Neck Fan",
    subtitle: "Wearable 360° bladeless neck fan — perfect for Pakistani summers.",
    buttonText: "Shop Now",
    buttonLink: "/shop/neck-fan",
    bg: "linear-gradient(135deg, #fff5f5 0%, #fff0e0 100%)",
    accentColor: "var(--red)",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
    type: "main"
  },
  {
    id: "block2",
    title: "Mobile\nAccessories",
    subtitle: "Chargers, Cables & More",
    buttonText: "Explore",
    buttonLink: "/shop/mobile-accessories",
    bg: "#e0f2fe",
    accentColor: "#0ea5e9",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&q=80",
    type: "wide"
  },
  {
    id: "block3",
    title: "Home",
    subtitle: "Smart gadgets",
    buttonText: "Learn More",
    buttonLink: "/shop/home-gadgets",
    bg: "#fff0f0",
    accentColor: "var(--red)",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    type: "small"
  },
  {
    id: "block4",
    title: "Computer",
    subtitle: "Stands, Hubs & More",
    buttonText: "Explore",
    buttonLink: "/shop/laptop-stand",
    bg: "#f0fdf4",
    accentColor: "#16a34a",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
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
