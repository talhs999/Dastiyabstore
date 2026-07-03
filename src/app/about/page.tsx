"use client";
import { useState, useEffect } from "react";
import { Award, Target, Users, ShoppingBag, Heart } from "lucide-react";
import * as Icons from "lucide-react";

const defaultTeam = [
  { name: "Yousuf Ahmed Khan", role: "Co-Founder & CEO", image: "" },
  { name: "Talha Khan", role: "Co-Founder & CTO", image: "" },
  { name: "Muddassir Rizwan", role: "Co-Founder & COO", image: "" },
];

const defaultStats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "48hr", label: "Avg. Delivery" },
  { value: "4.8★", label: "Rating" },
  { value: "100%", label: "Authentic" },
];

const milestones = [
  { year: "2026", title: "The Beginning", desc: "Founded DastiyabStore in Karachi with a vision to bring premium, tested gadgets to every Pakistani home." },
  { year: "2026", title: "Nationwide Logistics", desc: "Established partnerships with top couriers for reliable Cash on Delivery across Pakistan." },
  { year: "2026", title: "Quality Assurance Hub", desc: "Set up our dedicated testing facility to ensure zero-compromise quality before any product is shipped." },
  { year: "2026", title: "Growing Community", desc: "Rapidly expanding our trusted customer base with authentic tech products and 24/7 dedicated support." },
];

const AVATAR_COLORS = ["#e91e63", "#2196f3", "#4caf50", "#ff9800", "#9c27b0", "#00bcd4", "#ff5722", "#607d8b"];

export default function AboutPage() {
  const [team, setTeam] = useState(defaultTeam);
  const [statsDisplay, setStatsDisplay] = useState(defaultStats);

  useEffect(() => {
    // Fetch team members
    fetch("/api/settings/team")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTeam(data);
      })
      .catch(() => {});

    // Fetch stats strip
    fetch("/api/settings/stats")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length === 4) {
          setStatsDisplay(data.map((s: any) => ({
            value: `${s.value}${s.suffix}`,
            label: s.label
          })));
        }
      })
      .catch(() => {});
  }, []);

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 32, marginTop: 16 }}>
            {statsDisplay.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, color: "var(--red)", marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)", fontWeight: 600 }}>{s.label}</div>
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
          <div className="timeline-container" style={{ position: "relative" }}>
            <div className="timeline-line" />
            {milestones.map((m, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`}>
                <div className="timeline-card">
                  <div style={{ color: "var(--red)", fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{m.year}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.6 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .timeline-line {
            position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: var(--gray-200); transform: translateX(-50%);
          }
          .timeline-item {
            display: flex; gap: 24px; margin-bottom: 32px; width: 100%;
          }
          .timeline-item.left { justify-content: flex-start; }
          .timeline-item.right { justify-content: flex-end; }
          .timeline-card {
            width: 45%; background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-md); border: 1px solid var(--gray-200); position: relative;
          }
          @media(max-width: 768px){
            .timeline-line { left: 0; transform: none; }
            .timeline-item.left, .timeline-item.right { justify-content: flex-end; }
            .timeline-card { width: calc(100% - 24px); }
          }
        `}</style>
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
                  {member.image ? (
                    <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontWeight: 900, fontSize: 32 }}>
                        {member.name ? member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
                      </span>
                    </div>
                  )}
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
