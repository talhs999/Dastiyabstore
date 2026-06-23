import { RotateCcw, Shield, Package, CheckCircle, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Return & Refund Policy — DastiyabStore" };

export default function ReturnsPage() {
  return (
    <div>
      <section style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff9e6 100%)", padding: "64px 24px", textAlign: "center" }}>
        <span className="badge badge-red" style={{ marginBottom: 16 }}><RotateCcw size={12} /> Return Policy</span>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "var(--gray-900)", marginBottom: 12 }}>
          Easy <span style={{ color: "var(--red)" }}>Returns</span> & Refunds
        </h1>
        <p style={{ color: "var(--gray-500)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
          We want you to be 100% satisfied. If anything goes wrong, we're here to make it right.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>

        {/* Key highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 48 }}>
          {[
            { icon: <Clock size={28} />, title: "7-Day Window", desc: "Return within 7 days of delivery" },
            { icon: <Package size={28} />, title: "Easy Pickup", desc: "We pick up from your doorstep" },
            { icon: <Shield size={28} />, title: "Full Refund", desc: "100% money back guaranteed" },
          ].map((c, i) => (
            <div key={i} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "24px 20px", textAlign: "center", boxShadow: "var(--shadow-md)", border: "1px solid var(--gray-200)" }}>
              <div style={{ color: "var(--red)", marginBottom: 12, display: "flex", justifyContent: "center" }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Policy Content */}
        {[
          { icon: <CheckCircle size={20} />, color: "#16a34a", title: "Eligible for Return (Easy Returns)", items: ["Product received is damaged or broken", "Wrong product delivered", "Product does not match description", "Product is defective or not working", "Sealed/unused item in original packaging"] },
          { icon: <AlertTriangle size={20} />, color: "var(--yellow-dark)", title: "Not Eligible for Return", items: ["Product used or worn more than once", "Original packaging not available", "Return requested after 7 days", "Products on final sale or clearance", "Custom or personalized items"] },
        ].map((sec, i) => (
          <div key={i} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 28, marginBottom: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 20, color: sec.color }}>
              <span style={{ color: sec.color }}>{sec.icon}</span>
              {sec.title}
            </h2>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sec.items.map((item, j) => (
                <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "var(--gray-700)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: sec.color, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Process */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 28, marginBottom: 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Return Process</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { step: "1", title: "Contact Us", desc: "WhatsApp or call us at 0300-1234567 within 7 days of delivery." },
              { step: "2", title: "Pickup Arranged", desc: "Our courier will pick up the item from your address within 24 hours." },
              { step: "3", title: "Quality Check", desc: "Our team inspects the returned item within 2–3 business days." },
              { step: "4", title: "Refund Issued", desc: "Full refund issued via bank transfer or COD credit within 5 business days." },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < 3 ? 20 : 0, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--red)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                  {i < 3 && <div style={{ width: 2, flex: 1, background: "var(--gray-200)", marginTop: 4 }} />}
                </div>
                <div style={{ paddingBottom: i < 3 ? 20 : 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/contact" className="btn-red" style={{ textDecoration: "none" }}>
            Start a Return Request <ChevronRight size={16} />
          </Link>
        </div>
      </section>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: repeat(3, 1fr)"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
