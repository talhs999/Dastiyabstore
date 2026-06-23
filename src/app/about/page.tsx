"use client";
import { Award, Target, Users, ShoppingBag, Heart } from "lucide-react";

const team = [
  { name: "Amir Khan", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80" },
  { name: "Sara Malik", role: "Operations Manager", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80" },
  { name: "Bilal Ahmed", role: "Product Curator", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80" },
];

const milestones = [
  { year: "2023", title: "Founded", desc: "Started with a vision to bring quality gadgets to every Pakistani home." },
  { year: "2024", title: "1000+ Orders", desc: "Reached our first milestone of 1000 successful deliveries across Pakistan." },
  { year: "2025", title: "10,000+ Customers", desc: "Expanded our product catalog and customer base to 10,000+ happy buyers." },
  { year: "2026", title: "National Reach", desc: "Now delivering to all cities and towns across Pakistan with 48hr speed." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff9e6 100%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <span className="badge badge-red" style={{ marginBottom: 16 }}>About Us</span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: "var(--gray-900)", lineHeight: 1.2, marginBottom: 16 }}>
            Jo Chahiye, <span style={{ color: "var(--red)" }}>Wahi Dastiyab</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--gray-600)", lineHeight: 1.7, marginBottom: 32 }}>
            We started DastiyabStore with a simple mission: make quality tech gadgets and accessories accessible to every Pakistani — at fair prices, with trusted service.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {[{ n: "10,000+", l: "Happy Customers" }, { n: "48hr", l: "Avg. Delivery" }, { n: "4.8★", l: "Rating" }, { n: "100%", l: "Authentic" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--red)" }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: "72px 24px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: 16 }}>Our Mission</span>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 900, color: "var(--gray-900)", marginBottom: 16 }}>
              Built for <span style={{ color: "var(--red)" }}>Pakistan</span>
            </h2>
            <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 20, fontSize: 15 }}>
              Pakistan's online shopping landscape often lacks trust. We built DastiyabStore to change that — offering genuine products, transparent pricing, and hassle-free Cash on Delivery so everyone can shop with confidence.
            </p>
            <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: 15 }}>
              Our team personally tests every product before listing it, ensuring you get exactly what you see — no surprises, no compromises.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: <Heart size={24} />, title: "Customer First", desc: "Every decision is made with customer satisfaction in mind." },
              { icon: <Award size={24} />, title: "Quality Assured", desc: "Each product is personally tested and verified." },
              { icon: <Target size={24} />, title: "Fair Pricing", desc: "Best prices without compromising on quality." },
              { icon: <Users size={24} />, title: "Community", desc: "Building Pakistan's most trusted shopping community." },
            ].map((v, i) => (
              <div key={i} style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: 20, border: "1px solid var(--gray-200)", transition: "all 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; (e.currentTarget as HTMLElement).style.background = "#fff5f5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"; }}
              >
                <div style={{ color: "var(--red)", marginBottom: 10 }}>{v.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{v.title}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* Timeline */}
      <section style={{ padding: "72px 24px", background: "var(--gray-50)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="section-header">
            <h2>Our <span>Journey</span></h2>
            <p>From a small idea to Pakistan's growing e-commerce store</p>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "var(--gray-200)", transform: "translateX(-50%)" }} />
            {milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 24, marginBottom: 32, justifyContent: i % 2 === 0 ? "flex-start" : "flex-end" }}>
                <div style={{
                  width: "45%", background: "white", borderRadius: "var(--radius)",
                  padding: 20, boxShadow: "var(--shadow-md)", border: "1px solid var(--gray-200)",
                  marginLeft: i % 2 === 1 ? "auto" : 0,
                }}>
                  <div style={{ color: "var(--red)", fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{m.year}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.6 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "72px 24px", background: "white" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div className="section-header">
            <h2>Meet the <span>Team</span></h2>
            <p>The dedicated people behind DastiyabStore</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {team.map((member, i) => (
              <div key={i} style={{ textAlign: "center", transition: "all 0.3s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}
              >
                <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", border: "3px solid var(--red)", boxShadow: "var(--shadow-md)" }}>
                  <img src={member.img} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>{member.name}</div>
                <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 500 }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
