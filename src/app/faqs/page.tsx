"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    cat: "Orders & Delivery",
    questions: [
      { q: "How long does delivery take?", a: "Delivery to Karachi takes 2-3 working days minimum (may take longer in some cases). For all other cities, delivery takes 5-7 working days minimum." },
      { q: "Do you offer Cash on Delivery?", a: "Cash on Delivery (COD) is available ONLY in Karachi. For all other cities across Pakistan, please select our secure advance payment methods (Bank Transfer, EasyPaisa, or JazzCash)." },
      { q: "Is there a delivery charge?", a: "For Karachi: Delivery is FREE on orders above Rs. 3,000 (Base charge Rs. 250). For rest of Pakistan: Delivery is FREE on orders above Rs. 5,000 (Base charge Rs. 400)." },
      { q: "Can I track my order?", a: "Yes! Once your order is shipped, you'll receive an SMS with a tracking link. You can also check order status in your account under 'My Orders'." },
    ],
  },
  {
    cat: "Products & Quality",
    questions: [
      { q: "Are your products 100% authentic?", a: "Absolutely. Every product listed on DastiyabStore is personally tested by our team before listing. We guarantee quality and authenticity." },
      { q: "What if the product I received is defective?", a: "Contact us within 5 days via WhatsApp (0316-2975195) and we'll guide you on how to return it for a replacement or full refund." },
      { q: "Do you provide warranty on products?", a: "We do not offer any warranty on online shopping. However, if you receive a defective product, it will be thoroughly inspected, and a final decision regarding return or replacement will be made based on the inspection." },
    ],
  },
  {
    cat: "Returns & Refunds",
    questions: [
      { q: "What is your return policy?", a: "We offer a 5-day easy return policy. If you're not satisfied, just contact us within 5 days of delivery to initiate a return. Please note that return shipping costs are borne by the customer." },
      { q: "How long does a refund take?", a: "Refunds are processed within 5–7 business days after we receive and inspect the returned product." },
      { q: "Can I exchange a product?", a: "Yes, exchange is available for defective or wrong products received. Contact our support team to arrange an exchange." },
    ],
  },
];

export default function FAQsPage() {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => setOpen(prev => prev === id ? null : id);

  return (
    <div>
      <section style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff9e6 100%)", padding: "64px 24px", textAlign: "center" }}>
        <span className="badge badge-yellow" style={{ marginBottom: 16 }}><HelpCircle size={12} /> FAQs</span>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "var(--gray-900)", marginBottom: 12 }}>
          Frequently Asked <span style={{ color: "var(--red)" }}>Questions</span>
        </h1>
        <p style={{ color: "var(--gray-500)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
          Everything you need to know about shopping at DastiyabStore.
        </p>
      </section>

      <section style={{ maxWidth: 780, margin: "0 auto", padding: "64px 24px" }}>
        {faqs.map(cat => (
          <div key={cat.cat} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 20, background: "var(--red)", borderRadius: 2, display: "inline-block" }} />
              {cat.cat}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cat.questions.map((faq, i) => {
                const id = `${cat.cat}-${i}`;
                const isOpen = open === id;
                return (
                  <div key={i} style={{ background: "white", borderRadius: "var(--radius)", border: `2px solid ${isOpen ? "var(--red)" : "var(--gray-200)"}`, overflow: "hidden", transition: "border-color 0.25s", boxShadow: isOpen ? "0 4px 16px rgba(230,57,70,0.1)" : "none" }}>
                    <button onClick={() => toggle(id)} style={{
                      width: "100%", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12,
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: isOpen ? "var(--red)" : "var(--gray-900)" }}>{faq.q}</span>
                      <span style={{ flexShrink: 0, color: isOpen ? "var(--red)" : "var(--gray-400)" }}>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="animate-fade-down" style={{ padding: "0 20px 16px", color: "var(--gray-600)", fontSize: 14, lineHeight: 1.7 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ color: "var(--gray-500)", marginBottom: 16 }}>Still have questions?</p>
          <a href="/contact" className="btn-red" style={{ textDecoration: "none" }}>Contact Support</a>
        </div>
      </section>
    </div>
  );
}
