import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Get the actual client's IP address (not the server's IP)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let clientIp = "";
    
    if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    }
    
    // 2. Localhost fallback
    if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1") {
      return NextResponse.json({
        ip: "127.0.0.1",
        city: "Local",
        country_name: "Pakistan (Testing)"
      });
    }

    // 3. Fetch location for the specific client IP
    const res = await fetch(`http://ip-api.com/json/${clientIp}`, {
      headers: { 'User-Agent': 'NodeJS/NextJS Server' }
    });
    
    const data = await res.json();
    
    if (data.status === "success") {
      return NextResponse.json({
        ip: data.query,
        city: data.city,
        country_name: data.country
      });
    }

    throw new Error("Failed to parse location data");
    
  } catch (error) {
    console.error("IP API Error:", error);
    return NextResponse.json({
      ip: "Unknown IP",
      city: "Unknown",
      country_name: "Location Blocked",
      error: true
    });
  }
}
