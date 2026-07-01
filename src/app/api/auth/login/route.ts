import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Try matching by email
    let user = await prisma.customer.findFirst({
      where: { email: cleanEmail, password: cleanPassword }
    });


    if (user) {
      return NextResponse.json({ user });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
