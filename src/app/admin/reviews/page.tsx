"use client";
import { useState, useEffect } from "react";

import { Search, Trash2, MessageSquare, Star, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const res = await fetch("/api/admin/reviews");
    if (res.ok) {
      const reviewsData = await res.json();
      setReviews(reviewsData);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        alert("Failed to delete review");
      }
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    
    const res = await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reply_text: replyText })
    });

    if (res.ok) {
      setReviews(reviews.map(r => r.id === id ? { ...r, reply_text: replyText } : r));
      setReplyingTo(null);
      setReplyText("");
    } else {
      alert("Failed to submit reply");
    }
  };

  const filtered = reviews.filter(r => 
    r.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    r.review_text.toLowerCase().includes(search.toLowerCase()) ||
    r.product_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Product Reviews</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Manage customer feedback and replies</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input className="input" style={{ paddingLeft: 44, width: "100%", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} placeholder="Search by customer, review text, or product slug..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              {["Customer", "Product", "Rating & Review", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading reviews...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No reviews found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--gray-100)", verticalAlign: "top" }}>
                <td style={{ padding: "20px 24px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{r.customer_name}</div>
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <Link href={`/product/${r.product_id}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none", padding: "4px 10px", background: "#eff6ff", borderRadius: 6 }}>
                    {r.product_id} <ExternalLink size={12} />
                  </Link>
                </td>
                <td style={{ padding: "20px 24px", maxWidth: 400 }}>
                  <div style={{ display: "flex", gap: 2, color: "var(--yellow-dark)", marginBottom: 8 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} strokeWidth={i < r.rating ? 0 : 2} />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.5, margin: 0 }}>"{r.review_text}"</p>
                  
                  {r.reply_text ? (
                    <div style={{ marginTop: 12, padding: 12, background: "var(--gray-50)", borderLeft: "3px solid var(--gray-300)", borderRadius: "0 8px 8px 0" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-900)", display: "block", marginBottom: 4 }}>Your Reply:</span>
                      <p style={{ fontSize: 13, color: "var(--gray-600)", margin: 0 }}>{r.reply_text}</p>
                    </div>
                  ) : replyingTo === r.id ? (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      <textarea 
                        className="input" 
                        placeholder="Write your reply..." 
                        rows={2} 
                        value={replyText} 
                        onChange={e => setReplyText(e.target.value)}
                        style={{ resize: "none" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleReply(r.id)} style={{ padding: "6px 12px", background: "var(--gray-900)", color: "white", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Submit</button>
                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }} style={{ padding: "6px 12px", background: "var(--gray-200)", color: "var(--gray-700)", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </td>
                <td style={{ padding: "20px 24px", fontSize: 13, color: "var(--gray-500)" }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!r.reply_text && replyingTo !== r.id && (
                      <button onClick={() => setReplyingTo(r.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", transition: "all 0.2s" }} title="Reply">
                        <MessageSquare size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", transition: "all 0.2s" }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
