import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json({ error: 'Failed to fetch store settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      logo,
      banner,
      description,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      smtp_from,
      // Owner fields
      owner_name,
      phone,
      address,
      city
    } = body;

    if (!id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const existingStore = await prisma.store.findUnique({
      where: { id },
      include: { owner: true }
    });

    if (!existingStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // 1. Update Store Record
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        logo,
        banner,
        description,
        smtp_host: smtp_host ? smtp_host.trim() : null,
        smtp_port: smtp_port ? Number(smtp_port) : null,
        smtp_user: smtp_user ? smtp_user.trim() : null,
        smtp_pass: smtp_pass ? smtp_pass.trim() : null,
        smtp_from: smtp_from ? smtp_from.trim() : null
      }
    });

    // 2. Update Customer / Owner record (NAME, PHONE, ADDRESS, CITY ONLY)
    // CRITICAL: Strictly do NOT allow updating email or password from vendor dashboard!
    // As per requirement: "bas password apna and login email update nahi akren wo admin hi karsake"
    if (existingStore.owner_id) {
      await prisma.customer.update({
        where: { id: existingStore.owner_id },
        data: {
          ...(owner_name !== undefined ? { name: owner_name } : {}),
          ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
          ...(address !== undefined ? { address: address ? address.trim() : null } : {}),
          ...(city !== undefined ? { city: city ? city.trim() : null } : {})
        }
      });
    }

    // Return the updated store along with the updated owner
    const fullUpdatedStore = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true
          }
        }
      }
    });

    return NextResponse.json(fullUpdatedStore);
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json({ error: 'Failed to update store settings' }, { status: 500 });
  }
}
