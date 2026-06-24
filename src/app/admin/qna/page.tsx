"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Trash2, MessageSquare, ExternalLink, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AdminQnaPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("product_qna")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setQuestions(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await supabase.from("product_qna").delete().eq("id", id);
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    const { error } = await supabase
      .from("product_qna")
      .update({ 
        answer: replyText, 
        status: "answered",
        answered_at: new Date().toISOString()
      })
      .eq("id", id);
      
    if (!error) {
      setQuestions(questions.map(q => q.id === id ? { 
        ...q, 
        answer: replyText, 
        status: "answered",
        answered_at: new Date().toISOString() 
      } : q));
      setReplyingTo(null);
      setReplyText("");
    } else {
      alert("Failed to submit reply");
    }
  };

  const filtered = questions.filter(q => 
    q.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    q.product_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 4 }}>Product Q&A</h1>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>Answer customer questions about products</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input className="input" style={{ paddingLeft: 44, width: "100%", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }} placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              {["Customer", "Product", "Question & Answer", "Date", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>Loading questions...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}>No questions found.</td></tr>
            ) : filtered.map((q) => (
              <tr key={q.id} style={{ borderBottom: "1px solid var(--gray-100)", verticalAlign: "top" }}>
                <td style={{ padding: "20px 24px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)" }}>{q.customer_name}</div>
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <Link href={`/product/${q.product_id}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none", padding: "4px 10px", background: "#eff6ff", borderRadius: 6 }}>
                    {q.product_id} <ExternalLink size={12} />
                  </Link>
                </td>
                <td style={{ padding: "20px 24px", maxWidth: 400 }}>
                  <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                    <span style={{ color: "var(--gray-400)", marginRight: 8, fontWeight: 700 }}>Q:</span>
                    {q.question}
                  </p>
                  
                  {q.answer ? (
                    <div style={{ marginTop: 12, padding: 12, background: "#f0fdf4", borderLeft: "3px solid #22c55e", borderRadius: "0 8px 8px 0" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", display: "block", marginBottom: 4 }}>Admin Reply:</span>
                      <p style={{ fontSize: 13, color: "#15803d", margin: 0 }}>{q.answer}</p>
                    </div>
                  ) : replyingTo === q.id ? (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      <textarea 
                        className="input" 
                        placeholder="Type your answer..." 
                        rows={2} 
                        value={replyText} 
                        onChange={e => setReplyText(e.target.value)}
                        style={{ resize: "none" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleReply(q.id)} style={{ padding: "6px 12px", background: "var(--gray-900)", color: "white", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Submit Answer</button>
                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }} style={{ padding: "6px 12px", background: "var(--gray-200)", color: "var(--gray-700)", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </td>
                <td style={{ padding: "20px 24px", fontSize: 13, color: "var(--gray-500)" }}>
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "20px 24px" }}>
                  {q.status === "answered" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "#f0fdf4", color: "#16a34a", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                      <CheckCircle size={12} /> Answered
                    </span>
                  ) : (
                    <span style={{ display: "inline-block", padding: "4px 8px", background: "#fef3c7", color: "#d97706", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                      Pending
                    </span>
                  )}
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!q.answer && replyingTo !== q.id && (
                      <button onClick={() => setReplyingTo(q.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", transition: "all 0.2s" }} title="Answer">
                        <MessageSquare size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(q.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", transition: "all 0.2s" }} title="Delete">
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
