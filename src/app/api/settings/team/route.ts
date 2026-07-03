import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULTS = [
  { name: "Yousuf Ahmed Khan", role: "Co-Founder & CEO", image: "" },
  { name: "Talha Khan", role: "Co-Founder & CTO", image: "" },
  { name: "Muddassir Rizwan", role: "Co-Founder & COO", image: "" },
];

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'team_members' }
    });

    if (setting) {
      return NextResponse.json(setting.value);
    }

    return NextResponse.json(DEFAULTS);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(DEFAULTS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload: expected array of team members' }, { status: 400 });
    }

    const setting = await prisma.storeSetting.upsert({
      where: { key: 'team_members' },
      update: { value: body },
      create: { key: 'team_members', value: body }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save team' }, { status: 500 });
  }
}
