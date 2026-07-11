"use client";

import { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Calendar, Filter } from "lucide-react";
import Image from "next/image";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const fetchData = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--gray-900)", display: "flex", alignItems: "center", gap: 12 }}>
            <BarChart2 size={36} color="var(--red)" /> Product Demand Analytics
          </h1>
          <p style={{ color: "var(--gray-500)", marginTop: 8, fontSize: 16 }}>
            Track which products are added to the cart most frequently.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, background: "white", padding: 8, borderRadius: 12, border: "1px solid var(--gray-200)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          {[
            { label: "7 Days", value: "7" },
            { label: "30 Days", value: "30" },
            { label: "All Time", value: "all" }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: range === opt.value ? "var(--red)" : "transparent",
                color: range === opt.value ? "white" : "var(--gray-600)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 24, padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid var(--gray-100)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={24} color="var(--red)" /> Top Added to Cart
        </h2>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--gray-500)" }}>Loading analytics data...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--gray-500)" }}>No add-to-cart events found in this timeframe.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.map((item, index) => {
              // Calculate percentage width relative to the top item for the visual bar
              const maxAdds = data[0]?.adds || 1;
              const percentage = Math.max((item.adds / maxAdds) * 100, 5); // min 5% width

              return (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px", background: "var(--gray-50)", borderRadius: 16, border: "1px solid var(--gray-100)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-300)", width: 40, textAlign: "center" }}>
                    #{index + 1}
                  </div>
                  
                  <div style={{ width: 60, height: 60, borderRadius: 12, overflow: "hidden", position: "relative", flexShrink: 0, background: "white" }}>
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--gray-200)" }}></div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product.name}</span>
                      <span style={{ fontWeight: 700, color: "var(--red)" }}>{item.adds} adds</span>
                    </div>
                    
                    {/* Visual Bar */}
                    <div style={{ height: 8, background: "var(--gray-200)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ 
                        height: "100%", 
                        width: `${percentage}%`, 
                        background: "linear-gradient(90deg, var(--red) 0%, #ff5252 100%)",
                        borderRadius: 4,
                        transition: "width 1s ease-out"
                      }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
