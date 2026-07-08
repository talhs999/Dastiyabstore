import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (data.session_id) {
      if (data.current_url && data.current_url.startsWith('/admin')) {
        return NextResponse.json({ success: true, ignored: true });
      }

      await prisma.activeVisitor.upsert({
        where: { session_id: data.session_id },
        update: {
          current_url: data.current_url || '',
          location: data.location || '',
          ip_address: data.ip_address || '',
          device_type: data.device_type || '',
          browser: data.browser || '',
          last_active: new Date()
        },
        create: {
          session_id: data.session_id,
          current_url: data.current_url || '',
          location: data.location || '',
          ip_address: data.ip_address || '',
          device_type: data.device_type || '',
          browser: data.browser || '',
          last_active: new Date(),
          created_at: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update tracker' }, { status: 500 });
  }
}
