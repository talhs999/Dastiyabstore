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
import { unstable_cache } from "next/cache";
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

export const revalidate = 3600;

const getGlobalSettings = unstable_cache(
  async () => {
    let freeDeliverySettings = { is_active: true, threshold: 3000 };
    let contactSettings = {
      address: "H-151 Moinabad, Model Colony Phase 3 Malir, Karachi, 75100, Pakistan",
      email: "support@dastiyabstore.com",
      phone: "+92 316 2975195",
      aboutText: "Your trusted destination for tech gadgets and accessories in Pakistan. We build trust through quality products and fast delivery.",
      facebook: "#",
      instagram: "#",
      twitter: "#",
      youtube: "#",
      mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.66579294218!2d67.18247577583696!3d24.891375443315757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb3393daae898f5%3A0x6751d9459c7da81f!2sDastiyab%20Store!5e0!3m2!1sen!2s!4v1720371458999!5m2!1sen!2s"
    };
    let footerLinksSettings = {
      quickLinks: [
        { label: "Home", href: "/" },
        { label: "Shop All Products", href: "/shop" },
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact Us", href: "/contact" },
      ],
      categories: [
        { label: "Neckband Earphones", href: "/shop/neckband" },
        { label: "AirPods / TWS", href: "/shop/airpods" },
        { label: "Neck Fan", href: "/shop/neck-fan" },
        { label: "Laptop Stand", href: "/shop/laptop-stand" },
      ],
      support: [
        { label: "Track Your Order", href: "/track-order" },
        { label: "Return & Refund Policy", href: "/returns" },
        { label: "FAQs", href: "/faqs" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    };
    let promoBannerSettings = [
      "Cash on Delivery Available in Karachi",
      "Easy Returns within 5 Days",
      "100% Authentic Products"
    ];
    let liveTrackingEnabled = false;

    try {
      const fdSetting = await prisma.storeSetting.findUnique({
        where: { key: 'global_free_delivery' }
      });
      if (fdSetting && fdSetting.value) {
        freeDeliverySettings = typeof fdSetting.value === 'string' ? JSON.parse(fdSetting.value) : fdSetting.value as any;
      }

      const contactSetting = await prisma.storeSetting.findUnique({
        where: { key: 'contact_footer_settings' }
      });
      if (contactSetting && contactSetting.value) {
        contactSettings = typeof contactSetting.value === 'string' ? JSON.parse(contactSetting.value) : contactSetting.value as any;
      }

      const flSetting = await prisma.storeSetting.findUnique({
        where: { key: 'footer_links_settings' }
      });
      if (flSetting && flSetting.value) {
        footerLinksSettings = typeof flSetting.value === 'string' ? JSON.parse(flSetting.value) : flSetting.value as any;
      }

      const pbSetting = await prisma.storeSetting.findUnique({
        where: { key: 'promo_banner_settings' }
      });
      if (pbSetting && pbSetting.value) {
        promoBannerSettings = typeof pbSetting.value === 'string' ? JSON.parse(pbSetting.value) : pbSetting.value as any;
      }

      const trackingSetting = await prisma.storeSetting.findUnique({
        where: { key: 'live_tracking_settings' }
      });
      if (trackingSetting && trackingSetting.value) {
        const parsed = typeof trackingSetting.value === 'string' ? JSON.parse(trackingSetting.value) : trackingSetting.value as any;
        liveTrackingEnabled = parsed.enabled ?? false;
      }
    } catch (error) {
      console.warn("Failed to fetch global settings:", error);
    }

    return {
      freeDelivery: freeDeliverySettings,
      contact: contactSettings,
      footerLinks: footerLinksSettings,
      promoBanner: promoBannerSettings,
      liveTrackingEnabled
    };
  },
  ['global-layout-settings'],
  { revalidate: 3600, tags: ['settings'] }
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSettings = await getGlobalSettings();

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
            <VisitorTracker enabled={initialSettings.liveTrackingEnabled} />
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
