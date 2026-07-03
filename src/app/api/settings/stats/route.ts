import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULTS = [
  { value: "10000", suffix: "+", label: "Happy Customers", icon: "Heart" },
  { value: "500", suffix: "+", label: "Products Sold", icon: "Package" },
  { value: "4.8", suffix: "/5", label: "Average Rating", icon: "Star" },
  { value: "48", suffix: "hr", label: "Fast Delivery", icon: "Truck" },
];

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'stats_strip' }
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

    if (!Array.isArray(body) || body.length !== 4) {
      return NextResponse.json({ error: 'Invalid payload: expected array of 4 stats' }, { status: 400 });
    }

    const setting = await prisma.storeSetting.upsert({
      where: { key: 'stats_strip' },
      update: { value: body },
      create: { key: 'stats_strip', value: body }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save stats' }, { status: 500 });
  }
}
