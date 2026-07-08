import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Find customer by token and check expiry
    const customer = await prisma.customer.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gt: new Date() // Must be in the future
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    // Update password and clear token fields
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: password, // Note: storing plain text to match existing auth logic. In production, this should be hashed.
        reset_token: null,
        reset_token_expiry: null
      }
    });

    return NextResponse.json({ success: true, message: 'Password has been successfully reset' });

  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: 'An error occurred while resetting your password' }, { status: 500 });
  }
}
