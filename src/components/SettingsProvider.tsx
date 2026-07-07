"use client";
import { createContext, useContext, ReactNode } from "react";

type GlobalSettings = {
  freeDelivery: {
    is_active: boolean;
    threshold: number;
  };
  contact: {
    address: string;
    email: string;
    phone: string;
    aboutText: string;
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    mapIframe: string;
  };
  footerLinks: {
    quickLinks: { label: string; href: string }[];
    categories: { label: string; href: string }[];
    support: { label: string; href: string }[];
  };
};

const defaultSettings: GlobalSettings = {
  freeDelivery: {
    is_active: true,
    threshold: 2000,
  },
  contact: {
    address: "H-151 Moinabad, Model Colony Phase 3 Malir, Karachi, 75100, Pakistan",
    email: "support@dastiyabstore.com",
    phone: "+92 316 2975195",
    aboutText: "Your trusted destination for tech gadgets and accessories in Pakistan. We build trust through quality products and fast delivery.",
    facebook: "#",
    instagram: "#",
    twitter: "#",
    youtube: "#",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.66579294218!2d67.18247577583696!3d24.891375443315757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb3393daae898f5%3A0x6751d9459c7da81f!2sDastiyab%20Store!5e0!3m2!1sen!2s!4v1720371458999!5m2!1sen!2s"
  },
  footerLinks: {
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
  }
};

const SettingsContext = createContext<GlobalSettings>(defaultSettings);

export function SettingsProvider({ children, initialSettings }: { children: ReactNode, initialSettings?: GlobalSettings }) {
  return (
    <SettingsContext.Provider value={initialSettings || defaultSettings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
