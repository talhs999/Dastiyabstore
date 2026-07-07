import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      headers: {
        'User-Agent': 'NodeJS/NextJS Server',
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch IP data: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("IP API Error:", error);
    // Return a graceful fallback instead of failing completely
    return NextResponse.json({
      ip: "127.0.0.1",
      city: "Unknown",
      country_name: "Localhost/Blocked",
      error: true
    });
  }
}
