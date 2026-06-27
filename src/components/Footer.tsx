"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag,
  MapPin, Phone, Mail, Truck, RotateCcw, Shield, Headphones,
  CreditCard, ChevronRight, Send, Loader2, CheckCircle
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
  { icon: <RotateCcw size={28} />, title: "Easy Returns", sub: "5-day return policy" },
  { icon: <Shield size={28} />, title: "100% Secure", sub: "Trusted & verified" },
  { icon: <Headphones size={28} />, title: "24/7 Support", sub: "Always here to help" },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [newsletterEnabled, setNewsletterEnabled] = useState(true); // Default true
  
  useEffect(() => {
    const fetchSetting = async () => {
      const { data } = await supabase.from("store_settings").select("value").eq("key", "newsletter_enabled").single();
      if (data) setNewsletterEnabled(data.value === true || data.value === 'true');
    };
    fetchSetting();
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    
    setLoading(true);
    
    // Attempt to insert email (ignore error if already exists, they might just want the code again)
    await supabase.from("newsletter_subscribers").insert({ email });
    
    // Fetch active newsletter coupon
    const { data } = await supabase.from("coupons")
      .select("*")
      .eq("is_newsletter_coupon", true)
      .eq("is_active", true)
      .single();
    
    setSubscribed(true);
    if (data) {
      const discountText = data.discount_type === "percentage" ? `${data.discount_value}%` : `Rs ${data.discount_value}`;
      setCouponMessage(`Use code **${data.code}** for ${discountText} off your first order!`);
    } else {
      setCouponMessage("Thanks for subscribing! Keep an eye on your inbox for future deals.");
    }
    
    setLoading(false);
  };

  return (
    <footer>
      {/* Trust Bar */}
      <div style={{ background: "var(--gray-50)", padding: "40px 24px" }}>
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
      {newsletterEnabled && (
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

            {subscribed ? (
              <div className="animate-scale-in" style={{ maxWidth: 440, margin: "0 auto", background: "white", borderRadius: 16, padding: "24px 32px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ color: "#22c55e", display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <CheckCircle size={48} />
                </div>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 8 }}>You're In!</h4>
                <p style={{ color: "var(--gray-600)", fontSize: 15, lineHeight: 1.5 }}>
                  {couponMessage.includes("**") ? (
                    <>
                      Use code <strong style={{ color: "var(--red)", background: "var(--gray-100)", padding: "4px 8px", borderRadius: 6, fontSize: 18, margin: "0 4px" }}>{couponMessage.split("**")[1]}</strong> {couponMessage.split("**")[2]}
                    </>
                  ) : (
                    couponMessage
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 0, maxWidth: 440, margin: "0 auto", borderRadius: "var(--radius-full)", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  style={{ flex: 1, minWidth: 0, padding: "14px 20px", border: "none", fontSize: 14, fontFamily: "inherit", outline: "none", background: "white" }}
                  disabled={loading}
                />
                <button disabled={loading} style={{ flexShrink: 0, padding: "14px 24px", background: "var(--yellow)", border: "none", cursor: loading ? "not-allowed" : "pointer", color: "var(--black)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s" }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Subscribe
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Main Footer */}
      <div style={{ background: "white", padding: "80px 24px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 64 }}>

            {/* Column 1: Brand */}
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                <img src="/icon.png" alt="Dastiyab Store Logo" style={{ height: 56, width: 56, objectFit: "contain", flexShrink: 0 }} />
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--red)" }}>Dastiyab</span> <span style={{ color: "#FFB703" }}>Store</span>
                </span>
              </div>
              <p style={{ color: "var(--gray-600)", fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
                Jo Chahiye, Wahi Dastiyab — Your trusted destination for tech gadgets and accessories in Pakistan. We build trust through quality products and fast delivery.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { icon: <FacebookIcon />, href: "#" },
                  { icon: <InstagramIcon />, href: "#" },
                  { icon: <TwitterIcon />, href: "#" },
                ].map((s, i) => (
                  <a key={i} href={s.href} style={{ color: "var(--gray-500)", transition: "color 0.2s" }} 
                     onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--yellow)"} 
                     onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--gray-500)"}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)", marginBottom: 24 }}>Quick Links</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {footerLinks["Quick Links"].map(link => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ color: "var(--gray-600)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }} 
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--yellow)"} 
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--gray-600)"}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)", marginBottom: 24 }}>Support</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {footerLinks["Support"].map(link => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ color: "var(--gray-600)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }} 
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--yellow)"} 
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--gray-600)"}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Categories */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)", marginBottom: 24 }}>Categories</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {footerLinks["Categories"].map(link => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ color: "var(--gray-600)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }} 
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--yellow)"} 
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--gray-600)"}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Contact */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)", marginBottom: 24 }}>Contact</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                <li style={{ color: "var(--gray-600)", fontSize: 14 }}>Karachi, Sindh, Pakistan</li>
                <li style={{ color: "var(--gray-600)", fontSize: 14 }}>support@dastiyabstore.com</li>
                <li style={{ color: "var(--gray-600)", fontSize: 14 }}>+92 300 1234567</li>
                <li style={{ marginTop: 8 }}>
                  <Link href="/contact" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gray-600)", fontSize: 14, textDecoration: "none", transition: "color 0.2s", marginBottom: 12 }} 
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--yellow)"} 
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--gray-600)"}>
                    <MapPin size={16} /> View on Google Maps
                  </Link>
                  <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--gray-200)" }}>
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d924234.630043513!2d66.59498263595563!3d25.193389476710437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06651d4bbf%3A0x9cf92f44555a0c23!2sKarachi%2C%20Karachi%20City%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1718000000000!5m2!1sen!2s" width="100%" height="120" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 32, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <p style={{ color: "var(--gray-500)", fontSize: 13 }}>
              &copy; {new Date().getFullYear()} Dastiyab Store. All rights reserved.
            </p>
            
            {/* Payment Logos */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ background: "var(--gray-100)", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--gray-800)" }}>COD</span>
              </div>
              <div style={{ background: "var(--gray-100)", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center" }}>
                <img src="/easypaisa.png" alt="Easypaisa" style={{ height: 16, objectFit: "contain" }} />
              </div>
              <div style={{ background: "var(--gray-100)", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center" }}>
                <img src="/jazzcash.png" alt="JazzCash" style={{ height: 16, objectFit: "contain" }} />
              </div>
              <div style={{ background: "var(--gray-100)", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center" }}>
                <CreditCard size={16} color="var(--gray-600)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-600)", marginLeft: 4 }}>Bank</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 32 }}>
              <Link href="/privacy" style={{ color: "var(--gray-500)", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--yellow)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--gray-500)"}>Privacy Policy</Link>
              <Link href="/terms" style={{ color: "var(--gray-500)", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--yellow)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--gray-500)"}>Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
