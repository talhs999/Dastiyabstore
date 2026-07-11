import React from 'react';
import './gifts.css';
import GiftsPresentation from './GiftsPresentation';

export const metadata = {
  title: 'Custom Gift Baskets | DastiyabStore',
  description: 'Premium customizable gift baskets for all occasions. Order customized chocolates, flowers, and gifts via WhatsApp.',
};

export default function GiftsPage() {
  const WHATSAPP_NUMBER = "923162975195";
  const WHATSAPP_MESSAGE = encodeURIComponent("Hi DastiyabStore! I want to order a custom gift basket. Can you share some details?");
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="gifts-wrapper">
      <GiftsPresentation whatsappLink={whatsappLink} />
    </div>
  );
}
