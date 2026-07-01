import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.instagramPost.findMany({
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { shortcode } = await request.json();
    
    if (!shortcode) {
      return NextResponse.json({ error: 'shortcode is required' }, { status: 400 });
    }

    const newPost = await prisma.instagramPost.create({
      data: { shortcode }
    });

    return NextResponse.json(newPost);
  } catch (error: any) {
    console.error('API Error:', error);
    // Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This post is already added.', code: '23505' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.instagramPost.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
