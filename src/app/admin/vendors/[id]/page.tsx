"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, User, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchVendor();
  }, [params.id]);

  const fetchVendor = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/vendors/${params.id}`);
    if (res.ok) {
      setVendor(await res.json());
    } else {
      showToast("Failed to fetch vendor", "error");
    }
    setLoading(false);
  };

  const toggleProductField = async (productId: string, field: string, currentValue: boolean) => {
    // Optimistic update
    setVendor((prev: any) => ({
      ...prev,
      products: prev.products.map((p: any) => 
        p.id === productId ? { ...p, [field]: !currentValue } : p
      )
    }));

    const res = await fetch("/api/admin/products/toggle", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        field,
        value: !currentValue
      })
    });

    if (res.ok) {
      showToast("Updated successfully", "success");
    } else {
      // Revert if failed
      setVendor((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) => 
          p.id === productId ? { ...p, [field]: currentValue } : p
        )
      }));
      showToast("Failed to update", "error");
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading vendor details...</div>;
  if (!vendor) return <div style={{ padding: 40 }}>Vendor not found.</div>;

  return (
    <div style={{ padding: "32px 40px" }}>
      <button 
        onClick={() => router.back()} 
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--gray-600)", fontWeight: 600, cursor: "pointer", marginBottom: 24, fontSize: 14 }}
      >
        <ArrowLeft size={16} /> Back to Vendors
      </button>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <User size={20} color="var(--red)" /> Vendor Information
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Store Name</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{vendor.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Store URL Slug</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>/{vendor.slug}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Owner Name</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{vendor.owner?.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase" }}>Owner Email</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{vendor.owner?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={20} /> Vendor Products ({vendor.products?.length || 0})
          </h2>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>
            Control which products from this vendor appear in the homepage Featured and Best Seller sections.
          </p>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "white", borderBottom: "1px solid var(--gray-200)" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Product</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Price</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", textAlign: "center" }}>Best Seller</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", textAlign: "center" }}>Featured</th>
            </tr>
          </thead>
          <tbody>
            {!vendor.products || vendor.products.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>This vendor has no products yet.</td></tr>
            ) : vendor.products.map((product: any) => (
              <tr key={product.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {product.images && product.images.length > 0 && (
                      <img src={product.images[0]} alt={product.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gray-200)" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{product.category || "Uncategorized"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                  Rs. {product.sale_price || product.regular_price}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <button 
                    onClick={() => toggleProductField(product.id, "is_best_seller", product.is_best_seller)}
                    style={{ 
                      padding: "6px 12px", 
                      borderRadius: 20, 
                      border: "1px solid",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "0.2s",
                      backgroundColor: product.is_best_seller ? "#dcfce7" : "var(--gray-100)",
                      borderColor: product.is_best_seller ? "#bbf7d0" : "var(--gray-200)",
                      color: product.is_best_seller ? "#166534" : "var(--gray-500)",
                    }}
                  >
                    {product.is_best_seller ? <><Check size={14} /> Yes</> : <><X size={14} /> No</>}
                  </button>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <button 
                    onClick={() => toggleProductField(product.id, "is_featured", product.is_featured)}
                    style={{ 
                      padding: "6px 12px", 
                      borderRadius: 20, 
                      border: "1px solid",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "0.2s",
                      backgroundColor: product.is_featured ? "#dbeafe" : "var(--gray-100)",
                      borderColor: product.is_featured ? "#bfdbfe" : "var(--gray-200)",
                      color: product.is_featured ? "#1e40af" : "var(--gray-500)",
                    }}
                  >
                    {product.is_featured ? <><Check size={14} /> Yes</> : <><X size={14} /> No</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
