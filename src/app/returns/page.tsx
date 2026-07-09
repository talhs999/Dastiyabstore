import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | DastiyabStore",
  description: "Read our 5-day return and refund policy.",
};

export default function ReturnsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px", minHeight: "70vh" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--gray-500)", textDecoration: "none", marginBottom: 32, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldAlert size={24} color="var(--red)" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--gray-900)" }}>Return & Refund Policy</h1>
      </div>

      <div style={{ background: "white", padding: 40, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 24 }}>
        <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
          At DastiyabStore, we want you to be completely satisfied with your purchase. If you are not entirely happy with your order, we're here to help.
        </p>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>5-Day Return Window</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            You have <strong>5 days</strong> from the date you received your item to request a return or exchange. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. You will also need the receipt or proof of purchase.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Non-Returnable Items</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 12 }}>
            The following items are not eligible for return or exchange:
          </p>
          <ul style={{ color: "var(--gray-600)", lineHeight: 1.8, paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Used or damaged items caused by misuse</li>
            <li>Items without original packaging</li>
            <li>Products marked as non-returnable or final sale</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Warranty & Defective Products</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 12 }}>
            We do <strong>not</strong> offer any warranty on online shopping. However, if you receive a defective product:
          </p>
          <ul style={{ color: "var(--gray-600)", lineHeight: 1.8, paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>You must report the defect within the 5-day return window.</li>
            <li>The product will be returned to us and thoroughly inspected by our technical team.</li>
            <li>A final decision on whether the product qualifies for a return or replacement will be made <strong>only after the inspection is complete</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Refunds</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            Once we receive your returned item, we will inspect it and notify you of the approval or rejection of your refund. If your return is approved, we will initiate a refund to your original method of payment (or via EasyPaisa/JazzCash/Bank Transfer for COD orders). Refunds may take a few days to process depending on your card issuer's policies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>Shipping Returns</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            You will be responsible for paying your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)", marginBottom: 12 }}>How to Request a Return</h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
            To initiate a return, please contact our support team at <strong>support@dastiyabstore.com</strong> or call us at <strong>+92 316 2975195</strong> with your order number. Our team will guide you through the process.
          </p>
        </section>
      </div>
    </div>
  );
}
