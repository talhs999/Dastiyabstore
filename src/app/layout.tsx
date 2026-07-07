import { Inter, Poppins } from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import VisitorTracker from "@/components/VisitorTracker";
import { SettingsProvider } from "@/components/SettingsProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import Chatbot from "@/components/Chatbot";
import { prisma } from "@/lib/prisma";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ["latin"], 
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "DastiyabStore — Jo Chahiye, Wahi Dastiyab",
  description: "Pakistan's premium online store for tech gadgets, home accessories & more. Cash on Delivery available. Neck fans, AirPods, laptop stands & more.",
  keywords: "dastiyab store, pakistan online shopping, neck fan, airpods, laptop stand, earphones, COD",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "DastiyabStore — Jo Chahiye, Wahi Dastiyab",
    description: "Premium gadgets & accessories. Fast delivery across Pakistan. COD available.",
    type: "website",
  },
  verification: {
    google: "IwpEJoqgQmIi3hCd0CAu7Mx74w6MBkR9H_ZI6fHW76c",
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch global settings
  let freeDeliverySettings = { is_active: true, threshold: 2000 };
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'global_free_delivery' }
    });
    if (setting && setting.value) {
      freeDeliverySettings = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value as any;
    }
  } catch (error) {
    console.warn("Failed to fetch global settings:", error);
  }

  const initialSettings = {
    freeDelivery: freeDeliverySettings,
  };

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-ZFKEG15ZRC"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZFKEG15ZRC');
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=2538475113334898&ev=PageView&noscript=1" alt="" />
        </noscript>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2538475113334898');
              fbq('track', 'PageView');
            `,
          }}
        />
        <SettingsProvider initialSettings={initialSettings}>
          <ToastProvider>
            <VisitorTracker />
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <div className="no-print"><Navbar /></div>
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <div className="no-print"><Footer /></div>
            <div className="no-print"><WhatsAppButton /></div>
            <div className="no-print"><Chatbot /></div>
          </div>
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
