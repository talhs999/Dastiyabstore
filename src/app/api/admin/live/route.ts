import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Only fetch visitors active in the last 15 seconds
    const cutoffTime = new Date(Date.now() - 15000);
    
    const visitors = await prisma.activeVisitor.findMany({
      where: {
        last_active: {
          gt: cutoffTime
        }
      },
      orderBy: { last_active: 'desc' }
    });

    return NextResponse.json(visitors);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
