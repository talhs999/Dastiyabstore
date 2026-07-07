"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<{ ip: string; city: string; country: string } | null>(null);

  // 1. Initialize Session and fetch IP/Location
  useEffect(() => {
    // Generate/retrieve session ID from sessionStorage (persists across page reloads in same tab)
    let sId = sessionStorage.getItem("visitor_session_id");
    if (!sId) {
      sId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("visitor_session_id", sId);
    }
    setSessionId(sId);

    // Retrieve cached geo-IP details to avoid API spam
    const cachedGeo = sessionStorage.getItem("visitor_geo_data");
    if (cachedGeo) {
      try {
        setGeoData(JSON.parse(cachedGeo));
      } catch (e) {
        console.error("Error parsing cached geo data:", e);
      }
    } else {
      // Fetch fresh location details via our own backend API to avoid CORS/adblockers
      fetch("/api/ip")
        .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then(data => {
          const payload = {
            ip: data.ip || "Unknown IP",
            city: data.city || "",
            country: data.country_name || data.country || "Unknown Location"
          };
          setGeoData(payload);
          sessionStorage.setItem("visitor_geo_data", JSON.stringify(payload));
        })
        .catch(err => {
          // Silently fallback if ipapi fails (e.g. adblocker)
          const fallback = { ip: "127.0.0.1", city: "Local", country: "Pakistan" };
          setGeoData(fallback);
        });
    }
  }, []);

  // 2. Perform Heartbeats and update Current Page
  useEffect(() => {
    if (!sessionId || !geoData) return;

    // Detect device type
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const uaLower = userAgent.toLowerCase();
    let deviceType = "Desktop";
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(uaLower)) {
      deviceType = "Tablet";
    } else if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle|silk-accelerated|(hpw|web)os|opera m(obi|ini)/.test(uaLower)) {
      deviceType = "Mobile";
    }

    // Detect Browser
    let browserName = "Chrome";
    if (uaLower.indexOf("firefox") > -1) {
      browserName = "Firefox";
    } else if (uaLower.indexOf("safari") > -1 && uaLower.indexOf("chrome") === -1) {
      browserName = "Safari";
    } else if (uaLower.indexOf("edge") > -1 || uaLower.indexOf("edg") > -1) {
      browserName = "Edge";
    } else if (uaLower.indexOf("opr") > -1 || uaLower.indexOf("opera") > -1) {
      browserName = "Opera";
    }

    const locationString = geoData.city 
      ? `${geoData.city}, ${geoData.country}` 
      : geoData.country;

    // Send heartbeat to Supabase
    const sendPulse = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            current_url: pathname,
            location: locationString,
            ip_address: geoData.ip,
            device_type: deviceType,
            browser: browserName,
            last_active: new Date().toISOString()
          })
        });
      } catch (e) {
        // Silently fail if heartbeat fails (e.g. database unreachable locally)
      }
    };

    // Trigger pulse immediately on mount / path change
    sendPulse();

    // Pulse every 10 seconds to keep session active
    const pulseInterval = setInterval(sendPulse, 10000);

    return () => {
      clearInterval(pulseInterval);
    };
  }, [sessionId, geoData, pathname]);

  return null; // Silent tracker utility
}
