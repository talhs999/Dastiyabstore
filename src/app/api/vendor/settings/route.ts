import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const store = await prisma.store.findUnique({
      where: { id }
    });
    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch store settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, logo, banner, description, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from } = body;

    if (!id) return NextResponse.json({ error: 'Store ID required' }, { status: 400 });

    const store = await prisma.store.update({
      where: { id },
      data: { 
        name, 
        logo, 
        banner, 
        description,
        smtp_host,
        smtp_port: smtp_port ? Number(smtp_port) : null,
        smtp_user,
        smtp_pass,
        smtp_from
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update store settings' }, { status: 500 });
  }
}
