import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | DastiyabStore",
  description: "Read our terms and conditions.",
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px", minHeight: "70vh" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gray-500)", textDecoration: "none", marginBottom: 32, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={24} color="var(--gray-700)" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--gray-900)" }}>Terms & Conditions</h1>
      </div>

      <div style={{ background: "white", padding: 40, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 24 }}>
        <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
          Welcome to DastiyabStore. By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully before making a purchase.
        </p>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>General Conditions</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Products and Pricing</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            Prices for our products are subject to change without notice. We reserve the right to modify or discontinue a product without notice. We have made every effort to display the colors and images of our products accurately, but we cannot guarantee that your monitor's display of any color will be accurate.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Accuracy of Billing and Account Information</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and payment details, so that we can complete your transactions and contact you as needed.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Modifications to the Terms</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            We reserve the right to update, change, or replace any part of these Terms & Conditions by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes.
          </p>
        </section>
      </div>
    </div>
  );
}
