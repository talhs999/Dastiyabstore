"use client";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/emails/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to send message.");
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Failed to submit contact form:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <section style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff9e6 100%)", padding: "64px 24px 48px", textAlign: "center" }}>
        <span className="badge badge-red" style={{ marginBottom: 16 }}>Contact Us</span>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "var(--gray-900)", marginBottom: 12 }}>
          We're Here to <span style={{ color: "var(--red)" }}>Help</span>
        </h1>
        <p style={{ color: "var(--gray-500)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
          Got a question or need support? Our team is ready to assist you via WhatsApp, phone, or email.
        </p>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px" }}>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 48 }}>

          {/* Info Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: <Phone size={24} />, title: "Phone / WhatsApp", lines: ["0316-2975195", "Mon–Sat: 9 AM – 9 PM"] },
              { icon: <Mail size={24} />, title: "Email", lines: ["support@dastiyabstore.com", "Reply within 24 hours"] },
              { icon: <MapPin size={24} />, title: "Address", lines: ["H-151 Moinabad, Model Colony Phase 3 Malir", "Karachi, 75100, Pakistan"] },
              { icon: <Clock size={24} />, title: "Business Hours", lines: ["Monday – Saturday", "9:00 AM – 9:00 PM PKT"] },
            ].map((c, i) => (
              <div key={i} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-md)", border: "1px solid var(--gray-200)", display: "flex", gap: 16, alignItems: "flex-start", transition: "all 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; (e.currentTarget as HTMLElement).style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gray-200)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>{c.title}</div>
                  {c.lines.map((l, j) => <div key={j} style={{ fontSize: 14, color: "var(--gray-600)" }}>{l}</div>)}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#25d366", color: "white", padding: "16px 24px",
              borderRadius: "var(--radius-full)", textDecoration: "none",
              fontWeight: 700, fontSize: 15, transition: "all 0.25s", justifyContent: "center",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1da851"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#25d366"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 32, boxShadow: "var(--shadow-lg)", border: "1px solid var(--gray-200)" }}>
            {submitted ? (
              <div className="animate-scale-in" style={{ textAlign: "center", padding: "40px 0" }}>
                <CheckCircle size={56} color="var(--red)" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: "var(--gray-500)" }}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24 }}>Send a Message</h2>
                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: 12, marginBottom: 20, color: "#b91c1c", fontSize: 14 }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="contact-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="label">Your Name</label>
                      <input className="input" placeholder="Muhammad Ali" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Phone / WhatsApp</label>
                      <input className="input" placeholder="0316-2975195" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input className="input" type="email" placeholder="you@email.com" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <select className="input" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Issue">Order Issue</option>
                      <option value="Return Request">Return Request</option>
                      <option value="Product Question">Product Question</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea className="input" rows={5} placeholder="Tell us how we can help you..." required style={{ resize: "vertical" }} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn-red" style={{ justifyContent: "center", padding: "14px" }} disabled={loading}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {loading ? "Sending Message..." : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        
        {/* Map Section */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24, textAlign: "center" }}>Find Us in Karachi</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.66579294218!2d67.18247577583696!3d24.891375443315757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb3393daae898f5%3A0x6751d9459c7da81f!2sDastiyab%20Store!5e0!3m2!1sen!2s!4v1720371458999!5m2!1sen!2s"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: "var(--radius-lg)" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
      <style>{`@media(max-width:768px){.contact-grid{grid-template-columns:1fr!important}.contact-form-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
