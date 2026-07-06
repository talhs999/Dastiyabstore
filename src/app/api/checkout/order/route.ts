import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { order: orderData, items } = await request.json();

    // Nested create
    const newOrder = await prisma.order.create({
      data: {
        first_name: orderData.customer_name,
        email: orderData.customer_email,
        phone: orderData.customer_phone,
        address: typeof orderData.shipping_address === 'string' ? orderData.shipping_address : JSON.stringify(orderData.shipping_address),
        city: orderData.shipping_city,
        total: orderData.total_amount,
        payment_method: orderData.payment_method,
        status: orderData.status,
        subtotal: orderData.subtotal,
        shipping_fee: orderData.shipping_fee,
        discount_amount: orderData.discount_amount,
        coupon_code: orderData.coupon_code,
        order_notes: orderData.order_notes,
        items: items.map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          colorHex: item.colorHex
        }))
      }
    });

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
