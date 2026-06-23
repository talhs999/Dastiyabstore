"use client";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin, Phone, Mail, Truck, RotateCcw, Shield, Headphones,
  CreditCard, ChevronRight, Send
} from "lucide-react";

// Inline SVG social icons (lucide-react dropped platform-specific icons)
const FacebookIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
const InstagramIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
const TwitterIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>);
const YoutubeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>);

const footerLinks = {
  "Quick Links": [
    { label: "Home", href: "/" },
    { label: "Shop All Products", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  "Categories": [
    { label: "Neckband Earphones", href: "/shop/neckband" },
    { label: "AirPods / TWS", href: "/shop/airpods" },
    { label: "Neck Fan", href: "/shop/neck-fan" },
    { label: "Laptop Stand", href: "/shop/laptop-stand" },
  ],
  "Support": [
    { label: "Track Your Order", href: "/track-order" },
    { label: "Return & Refund Policy", href: "/returns" },
    { label: "FAQs", href: "/faqs" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

const trustFeatures = [
  { icon: <Truck size={28} />, title: "Free Delivery", sub: "On orders Rs.2000+" },
  { icon: <RotateCcw size={28} />, title: "Easy Returns", sub: "7-day return policy" },
  { icon: <Shield size={28} />, title: "100% Secure", sub: "Trusted & verified" },
  { icon: <Headphones size={28} />, title: "24/7 Support", sub: "Always here to help" },
];

export default function Footer() {
  return (
    <footer>
      {/* Trust Bar */}
      <div style={{ background: "var(--gray-50)", borderTop: "3px solid var(--yellow)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {trustFeatures.map((f, i) => (
              <div key={i} className="trust-badge" style={{ flexDirection: "column", textAlign: "center", padding: "24px 16px", gap: 12 }}>
                <div style={{ color: "var(--red)" }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div style={{
        background: "linear-gradient(135deg, var(--red) 0%, #c62333 50%, #9b1526 100%)",
        padding: "60px 24px",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Mail size={28} color="white" />
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8 }}>
            Get Exclusive Deals
          </h3>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 28, fontSize: 15 }}>
            Subscribe to our newsletter for latest products & special offers.
          </p>
          <div style={{ display: "flex", gap: 0, maxWidth: 440, margin: "0 auto", borderRadius: "var(--radius-full)", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <input
              type="email"
              placeholder="Enter your email address"
              style={{ flex: 1, padding: "14px 20px", border: "none", fontSize: 14, fontFamily: "inherit", outline: "none", background: "white" }}
            />
            <button style={{ padding: "14px 24px", background: "var(--yellow)", border: "none", cursor: "pointer", color: "var(--black)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s" }}>
              <Send size={16} />
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ background: "var(--gray-900)", padding: "64px 24px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, auto)", gap: 48, marginBottom: 48 }}>

            {/* Brand Column */}
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--red), var(--yellow))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingBag size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "var(--red)", lineHeight: 1 }}>Dastiyab</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--yellow)", letterSpacing: "2px", textTransform: "uppercase" }}>Store</div>
                </div>
              </div>
              <p style={{ color: "var(--gray-400)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Jo Chahiye, Wahi Dastiyab — Your trusted destination for tech gadgets and accessories in Pakistan. Quality products, fast delivery, and Cash on Delivery available nationwide.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: <MapPin size={15} />, text: "Karachi, Sindh, Pakistan" },
                  { icon: <Phone size={15} />, text: "0300-1234567" },
                  { icon: <Mail size={15} />, text: "support@dastiyabstore.com" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gray-400)", fontSize: 14 }}>
                    <span style={{ color: "var(--red)", flexShrink: 0 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 3, height: 18, background: "var(--red)", borderRadius: 2, display: "inline-block" }} />
                  {title}
                </h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {links.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} style={{ color: "var(--gray-400)", textDecoration: "none", fontSize: 14, display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--yellow)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--gray-400)"}
                      >
                        <ChevronRight size={13} />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment & Social */}
          <div style={{ borderTop: "1px solid var(--gray-800)", paddingTop: 32, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div>
              <p style={{ color: "var(--gray-500)", fontSize: 13, marginBottom: 12 }}>We accept</p>
              <div style={{ display: "flex", gap: 8 }}>
                {["COD", "JazzCash", "EasyPaisa", "Visa"].map(p => (
                  <div key={p} style={{ padding: "6px 12px", background: "var(--gray-800)", borderRadius: 6, color: "var(--gray-300)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <CreditCard size={12} />
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: <FacebookIcon />, href: "#", label: "Facebook" },
                { icon: <InstagramIcon />, href: "#", label: "Instagram" },
                { icon: <TwitterIcon />, href: "#", label: "Twitter" },
                { icon: <YoutubeIcon />, href: "#", label: "Youtube" },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--gray-800)", color: "var(--gray-400)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", transition: "all 0.25s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--red)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--gray-800)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-400)"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ color: "var(--gray-600)", fontSize: 13 }}>
              &copy; {new Date().getFullYear()} DastiyabStore.com — All rights reserved. Made in Pakistan with love.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
