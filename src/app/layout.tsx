import { Inter, Poppins } from "next/font/google";
import type { Metadata } from "next";
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
      <body className="font-sans">
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
