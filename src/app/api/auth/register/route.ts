import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const existing = await prisma.customer.findFirst({
      where: { email: body.email }
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        phone: body.phone
      }
    });

    return NextResponse.json({ user: newCustomer });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
