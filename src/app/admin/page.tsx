"use client";
import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalBuyingCost, setTotalBuyingCost] = useState(0);
  const [totalCourierPaid, setTotalCourierPaid] = useState(0);
  
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [profitChange, setProfitChange] = useState(0);
  const [activeChange, setActiveChange] = useState(0);
  const [productsChange, setProductsChange] = useState(0);
  const [customersChange, setCustomersChange] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      
      const { orders: ordersData, products: productsData } = await res.json();

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    const calculateCostDetails = (orders: any[]) => {
      let buyingCost = 0;
      let courierPaid = 0;
      orders.forEach(order => {
        const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        buyingCost += orderItems.reduce((costAcc: number, item: any) => costAcc + ((item.buying_cost || 0) * (item.quantity || 1)), 0);
        courierPaid += (order.delivery_paid || 0);
      });
      return { buyingCost, courierPaid };
    };

    const calculateProfit = (orders: any[]) => {
      const { buyingCost, courierPaid } = calculateCostDetails(orders);
      return orders.reduce((acc, order) => acc + (order.total || 0), 0) - buyingCost - courierPaid;
    };

    if (ordersData) {
      setOrders(ordersData);
      
      const rev = ordersData.reduce((acc: any, order: any) => acc + (order.total || 0), 0);
      setTotalRevenue(rev);

      const profit = calculateProfit(ordersData);
      setTotalProfit(profit);
      
      const { buyingCost, courierPaid } = calculateCostDetails(ordersData);
      setTotalBuyingCost(buyingCost);
      setTotalCourierPaid(courierPaid);
      
      const uniqueEmails = new Set(ordersData.map((o: any) => o.email).filter(Boolean));
      setTotalCustomers(uniqueEmails.size);

      // Percentage Change Calculations:
      const currentPeriodOrders = ordersData.filter((o: any) => new Date(o.created_at) >= thirtyDaysAgo);
      const previousPeriodOrders = ordersData.filter((o: any) => {
        const d = new Date(o.created_at);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      });

      // Revenue Change
      const revCurrent = currentPeriodOrders.reduce((acc: any, order: any) => acc + (order.total || 0), 0);
      const revPrevious = previousPeriodOrders.reduce((acc: any, order: any) => acc + (order.total || 0), 0);
      setRevenueChange(calculatePercentageChange(revCurrent, revPrevious));

      // Profit Change
      const profCurrent = calculateProfit(currentPeriodOrders);
      const profPrevious = calculateProfit(previousPeriodOrders);
      setProfitChange(calculatePercentageChange(profCurrent, profPrevious));

      // Active Orders Change
      const activeCurrent = currentPeriodOrders.filter((o: any) => o.status !== "delivered" && o.status !== "cancelled").length;
      const activePrevious = previousPeriodOrders.filter((o: any) => o.status !== "delivered" && o.status !== "cancelled").length;
      setActiveChange(calculatePercentageChange(activeCurrent, activePrevious));

      // Customers Change
      const custCurrent = new Set(currentPeriodOrders.map((o: any) => o.email).filter(Boolean)).size;
      const custPrevious = new Set(previousPeriodOrders.map((o: any) => o.email).filter(Boolean)).size;
      setCustomersChange(calculatePercentageChange(custCurrent, custPrevious));
    }

    if (productsData) {
      setProductsCount(productsData.length);

      const currentProds = productsData.filter((p: any) => new Date(p.created_at) >= thirtyDaysAgo).length;
      const previousProds = productsData.filter((p: any) => {
        const d = new Date(p.created_at);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      }).length;
      setProductsChange(calculatePercentageChange(currentProds, previousProds));
    }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "TOTAL REVENUE", 
      value: `Rs ${totalRevenue.toLocaleString()}`, 
      icon: <DollarSign size={20} color="var(--gray-500)" />,
      change: revenueChange 
    },
    { 
      label: "TOTAL PROFIT", 
      value: `Rs ${totalProfit.toLocaleString()}`, 
      icon: <DollarSign size={20} color="#10b981" />,
      change: profitChange,
      color: "#10b981"
    },
    { 
      label: "ACTIVE ORDERS", 
      value: orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length, 
      icon: <ShoppingCart size={20} color="var(--gray-500)" />,
      change: activeChange 
    },
    { 
      label: "PRODUCTS", 
      value: productsCount, 
      icon: <Package size={20} color="var(--gray-500)" />,
      change: productsChange 
    },
    { 
      label: "TOTAL CUSTOMERS", 
      value: totalCustomers, 
      icon: <Users size={20} color="var(--gray-500)" />,
      change: customersChange 
    },
  ];

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--gray-900)" }}>Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ background: "white", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "var(--gray-900)", lineHeight: 1 }}>{stat.value}</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                {stat.change > 0 ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
                    <ArrowUpRight size={14} /> +{stat.change}%
                  </span>
                ) : stat.change < 0 ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                    <ArrowDownRight size={14} /> {stat.change}%
                  </span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 4 }}>
                    0%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", padding: 24, marginBottom: 40, boxShadow: "var(--shadow-sm)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--gray-900)", marginBottom: 20 }}>Financial Summary (Excel View)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 8 }}>Total Order Value</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>Rs {totalRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 8 }}>Total Buying Cost</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--red)" }}>Rs {totalBuyingCost.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 8 }}>Courier Delivery Paid</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--red)" }}>Rs {totalCourierPaid.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 8 }}>Net Margin / Profit</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>Rs {totalProfit.toLocaleString()}</div>
          </div>
          <div style={{ borderLeft: "1px dashed var(--gray-200)", paddingLeft: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 8 }}>Margin %</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>
              {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0"}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", marginBottom: 8 }}>Avg Order Value (AOV)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--blue)" }}>
              Rs {orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : "0"}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Orders Breakdown */}
      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--gray-100)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>Orders Breakdown</h2>
          <Link href="/admin/orders" style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", textDecoration: "none", textTransform: "uppercase" }}>View All</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-100)" }}>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Order ID</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Customer</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Revenue</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Buying Cost</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Courier Paid</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Net Margin</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase" }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--gray-500)" }}>Loading...</td></tr>
              ) : orders.slice(0, 10).map(o => {
                const orderItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
                const buyingCost = orderItems.reduce((acc: number, item: any) => acc + ((item.buying_cost || 0) * (item.quantity || 1)), 0);
                const courierPaid = o.delivery_paid || 0;
                const revenue = o.total || 0;
                const margin = revenue - buyingCost - courierPaid;
                const marginPercent = revenue > 0 ? ((margin / revenue) * 100).toFixed(1) : "0";

                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "var(--gray-900)" }}>...{o.id.split("-")[0]}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-600)" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--gray-700)" }}>{o.first_name} {o.last_name || ''}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "var(--gray-900)" }}>Rs {revenue.toLocaleString()}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--red)" }}>Rs {buyingCost.toLocaleString()}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "var(--red)" }}>Rs {courierPaid.toLocaleString()}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "#10b981" }}>Rs {margin.toLocaleString()}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "#10b981" }}>{marginPercent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
