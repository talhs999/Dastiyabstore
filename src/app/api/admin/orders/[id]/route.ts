import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: any) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const updateData: any = {};
    if (data.delivery_paid !== undefined) updateData.delivery_paid = parseFloat(data.delivery_paid);
    if (data.items !== undefined) updateData.items = data.items;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
