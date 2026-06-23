import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "DastiyabStore — Jo Chahiye, Wahi Dastiyab",
  description: "Pakistan's premium online store for tech gadgets, home accessories & more. Cash on Delivery available. Neck fans, AirPods, laptop stands & more.",
  keywords: "dastiyab store, pakistan online shopping, neck fan, airpods, laptop stand, earphones, COD",
  openGraph: {
    title: "DastiyabStore — Jo Chahiye, Wahi Dastiyab",
    description: "Premium gadgets & accessories. Fast delivery across Pakistan. COD available.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ToastProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
