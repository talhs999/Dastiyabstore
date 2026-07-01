import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rules = await prisma.shippingRule.findMany();

    const areas = await prisma.deliveryArea.findMany();

    const settings = await prisma.storeSetting.findUnique({
      where: { key: 'payment_settings' }
    });

    let paymentSettings = {};
    if (settings && settings.value) {
      paymentSettings = typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value;
    }

    return NextResponse.json({ rules, areas, paymentSettings });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load checkout config' }, { status: 500 });
  }
}
