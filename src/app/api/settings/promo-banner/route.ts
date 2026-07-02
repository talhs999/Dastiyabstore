import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'promo_banner' }
    });
    
    if (setting && setting.value) {
      let data = setting.value;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      return NextResponse.json(data);
    }
    return NextResponse.json(null);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const setting = await prisma.storeSetting.upsert({
      where: { key: 'promo_banner' },
      update: { value: JSON.stringify(data) },
      create: {
        key: 'promo_banner',
        value: JSON.stringify(data)
      }
    });
    
    return NextResponse.json(setting);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
