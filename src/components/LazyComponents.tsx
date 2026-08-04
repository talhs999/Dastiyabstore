"use client";
import dynamic from "next/dynamic";

// Lazy load below-the-fold components to improve LCP/FCP
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"), { ssr: false });
const Chatbot = dynamic(() => import("@/components/Chatbot"), { ssr: false });

export function LazyFooter() {
  return <Footer />;
}

export function LazyWhatsAppButton() {
  return <WhatsAppButton />;
}

export function LazyChatbot() {
  return <Chatbot />;
}
