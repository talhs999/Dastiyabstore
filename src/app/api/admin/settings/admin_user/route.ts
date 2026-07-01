import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { currentPassword, newPassword, userEmail } = data;

    // Verify current password
    let user = await prisma.customer.findFirst({
      where: {
        email: userEmail,
        password: currentPassword
      }
    });

    if (!user) {
      // Fallback logic for hardcoded first-time setup
      if (currentPassword === "dastiyab@123" && userEmail === "admin@dastiyab.com") {
        let existingAdmin = await prisma.customer.findUnique({
          where: { email: "admin@dastiyab.com" }
        });

        if (existingAdmin) {
          user = await prisma.customer.update({
            where: { id: existingAdmin.id },
            data: { password: newPassword }
          });
        } else {
          user = await prisma.customer.create({
            data: {
              email: "admin@dastiyab.com",
              password: newPassword,
              name: "Administrator",
              role: "ADMIN",
            } // We'll let phone default or be null depending on schema
          });
        }
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
    }

    // Update the password
    await prisma.customer.update({
      where: { id: user.id },
      data: { password: newPassword }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
