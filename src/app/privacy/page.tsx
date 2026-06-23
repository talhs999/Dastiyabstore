import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DastiyabStore",
  description: "Read our privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px", minHeight: "70vh" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gray-500)", textDecoration: "none", marginBottom: 32, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldCheck size={24} color="#16a34a" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--gray-900)" }}>Privacy Policy</h1>
      </div>

      <div style={{ background: "white", padding: 40, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 24 }}>
        <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
          At DastiyabStore, your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website and services.
        </p>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Information We Collect</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact customer support. This may include your name, email address, phone number, shipping address, and payment information.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>How We Use Your Information</h2>
          <ul style={{ color: "var(--gray-600)", lineHeight: 1.8, paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>To process and fulfill your orders, including sending order confirmations and tracking details.</li>
            <li>To communicate with you about products, services, promotions, and updates.</li>
            <li>To improve our website, services, and customer experience.</li>
            <li>To detect and prevent fraud or abuse of our services.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Data Protection & Security</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or alteration. We do not sell or share your personal data with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Contact Us</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            If you have any questions or concerns about this Privacy Policy, please contact us at <strong>support@dastiyabstore.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
