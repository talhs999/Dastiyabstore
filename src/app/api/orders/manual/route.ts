import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      city, 
      state,
      postalCode,
      description, 
      price, 
      advanceReceived, 
      notes 
    } = body;

    // Validation
    if (!firstName || !phone || !address || !city || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const itemPrice = parseFloat(price);
    const advance = parseFloat(advanceReceived || 0);

    const items = [
      {
        id: 'manual-custom-gift',
        name: `Custom Order: ${description}`,
        price: itemPrice,
        quantity: 1,
        image: '/images/gifts/gift-1.jpeg',
      }
    ];

    const orderData = {
      first_name: firstName,
      last_name: lastName || '',
      email: email || '',
      phone: phone,
      address: address,
      city: city,
      state: state || '',
      postal_code: postalCode || '',
      total: itemPrice,
      subtotal: itemPrice,
      shipping_fee: 0,
      discount_amount: advance, // Using discount to represent advance payment for total calculation
      payment_method: advance > 0 ? (advance >= itemPrice ? 'Paid in Advance' : 'Partial Advance') : 'COD',
      status: 'processing',
      items: JSON.stringify(items),
      order_notes: `Manual Order: ${notes || ''} | Advance Paid: Rs. ${advance}`,
    };

    const order = await prisma.order.create({
      data: orderData
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error('Manual order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
