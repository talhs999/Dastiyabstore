import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { email: email || undefined },
          { phone: phone || undefined }
        ]
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
