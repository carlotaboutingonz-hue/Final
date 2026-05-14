import { useState, useEffect, useRef } from "react";

// ── Mock "database" data ──────────────────────────────────────────────────────
const DB_DRESSES = [
  { id: "SS-001", name: "Valentino Red Gown", category: "Gala", size: "S", stock: 2, price: 89, rentals: 14, status: "available", img: "🔴" },
  { id: "SS-002", name: "Zimmermann Linen", category: "Garden Party", size: "M", stock: 0, price: 65, rentals: 22, status: "rented", img: "🌸" },
  { id: "SS-003", name: "Self-Portrait Midi", category: "Cocktail", size: "S", stock: 1, price: 72, rentals: 9, status: "available", img: "🪷" },
  { id: "SS-004", name: "Rotate Birger Christia", category: "Cocktail", size: "L", stock: 3, price: 58, rentals: 17, status: "available", img: "💜" },
  { id: "SS-005", name: "Reformation Slip Dress", category: "Casual", size: "XS", stock: 0, price: 45, rentals: 31, status: "maintenance", img: "🤍" },
  { id: "SS-006", name: "Jacquemus La Robe", category: "Beach", size: "M", stock: 2, price: 79, rentals: 8, status: "available", img: "🧡" },
  { id: "SS-007", name: "Ganni Floral Wrap", category: "Garden Party", size: "L", stock: 1, price: 52, rentals: 19, status: "rented", img: "🌼" },
  { id: "SS-008", name: "Rixo Golden Hour", category: "Gala", size: "M", stock: 0, price: 95, rentals: 6, status: "rented", img: "✨" },
];

const DB_USERS = [
  { id: "U-1042", name: "Sofía Martínez", email: "sofia@gmail.com", joined: "2024-09-12", rentals: 4, spent: 312, status: "active" },
  { id: "U-1043", name: "Laura García", email: "laura.g@outlook.com", joined: "2024-10-03", rentals: 7, spent: 498, status: "active" },
  { id: "U-1044", name: "Martina López", email: "martina@gmail.com", joined: "2024-11-15", rentals: 1, spent: 65, status: "active" },
  { id: "U-1045", name: "Isabella Ruiz", email: "isa.ruiz@icloud.com", joined: "2025-01-07", rentals: 2, spent: 144, status: "active" },
  { id: "U-1046", name: "Carmen Sánchez", email: "carmen.s@gmail.com", joined: "2025-02-20", rentals: 5, spent: 355, status: "suspended" },
  { id: "U-1047", name: "Elena Fernández", email: "elena.f@gmail.com", joined: "2025-03-01", rentals: 3, spent: 217, status: "active" },
];

const DB_ORDERS = [
  { id: "ORD-2891", user: "Sofía Martínez", dress: "Valentino Red Gown", date: "2025-05-10", return: "2025-05-14", amount: 89, status: "active" },
  { id: "ORD-2890", user: "Laura García", dress: "Zimmermann Linen", date: "2025-05-09", return: "2025-05-13", amount: 65, status: "active" },
  { id: "ORD-2889", user: "Isabella Ruiz", dress: "Rixo Golden Hour", date: "2025-05-08", return: "2025-05-12", amount: 95, status: "returned" },
  { id: "ORD-2888", user: "Elena Fernández", dress: "Ganni Floral Wrap", date: "2025-05-07", return: "2025-05-11", amount: 52, status: "returned" },
  { id: "ORD-2887", user: "Martina López", dress: "Zimmermann Linen", date: "2025-05-06", return: "2025-05-10", amount: 65, status: "returned" },
  { id: "ORD-2886", user: "Laura García", dress: "Self-Portrait Midi", date: "2025-05-05", return: "2025-05-09", amount: 72, status: "late" },
  { id: "ORD-2885", user: "Sofía Martínez", dress: "Jacquemus La Robe", date: "2025-05-03", return: "2025-05-07", amount: 79, status: "returned" },
  { id: "ORD-2884", user: "Carmen Sánchez", dress: "Rotate Birger Christia", date: "2025-05-01", return: "2025-05-05", amount: 58, status: "returned" },
];

// ── DB connection simulation ──────────────────────────────────────────────────
function useDatabase() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [ping, setPing] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [queryCount, setQueryCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      setPing(Math.floor(Math.random() * 18) + 6);
      setLastSync(new Date());
      setQueryCount(Math.floor(Math.random() * 40) + 10);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 18) + 6);
      setLastSync(new Date());
      setQueryCount(c => c + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [connected]);

  return { connected, connecting, ping, lastSync, queryCount };
}

function useDataLoad(data, delay = 900) {
  const [loaded, setLoaded] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setLoaded([]);
    const t = setTimeout(() => {
      setLoaded(data);
      setLoading(false);
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return { loaded, loading };
}

// ── Subcomponents ─────────────────────────────────────────────────────────────
function Pulse({ color = "#22c55e" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: color,
        boxShadow: `0 0 0 0 ${color}`,
        animation: "pulseRing 2s infinite",
        display: "inline-block"
      }} />
    </span>
  );
}

function DBStatusBar({ connected, connecting, ping, lastSync, queryCount }) {
  return (
    <div style={{
      background: connected ? "linear-gradient(135deg, #0f2a1a 0%, #0a1f14 100%)" : "#1a1a2e",
      border: `1px solid ${connected ? "#1a4731" : "#2d2d4e"}`,
      borderRadius: 10,
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      flexWrap: "wrap",
      marginBottom: 24,
      fontSize: 12,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {connecting ? (
          <span style={{ color: "#facc15" }}>⟳</span>
        ) : (
          <Pulse color={connected ? "#22c55e" : "#ef4444"} />
        )}
        <span style={{ color: connected ? "#4ade80" : "#f87171", fontWeight: 600 }}>
          {connecting ? "Connecting to DB..." : connected ? "PostgreSQL · Connected" : "Disconnected"}
        </span>
      </div>
      {connected && (
        <>
          <div style={{ color: "#6b7280" }}>
            <span style={{ color: "#9ca3af" }}>host:</span>{" "}
            <span style={{ color: "#d1d5db" }}>db.secondseason.es:5432</span>
          </div>
          <div style={{ color: "#6b7280" }}>
            <span style={{ color: "#9ca3af" }}>ping:</span>{" "}
            <span style={{ color: "#34d399" }}>{ping}ms</span>
          </div>
          <div style={{ color: "#6b7280" }}>
            <span style={{ color: "#9ca3af" }}>queries:</span>{" "}
            <span style={{ color: "#60a5fa" }}>{queryCount}</span>
          </div>
          <div style={{ color: "#6b7280", marginLeft: "auto" }}>
            <span style={{ color: "#9ca3af" }}>last sync:</span>{" "}
            <span style={{ color: "#d1d5db" }}>
              {lastSync ? lastSync.toLocaleTimeString("es-ES") : "—"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon, loading }) {
  return (
    <div style={{
      background: "#111827",
      border: "1px solid #1f2937",
      borderRadius: 12,
      padding: "20px 24px",
      flex: "1 1 160px",
      minWidth: 160,
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      {loading ? (
        <div style={{ height: 32, width: "60%", background: "#1f2937", borderRadius: 6, animation: "shimmer 1.5s infinite" }} />
      ) : (
        <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      )}
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    available: { bg: "#052e16", color: "#4ade80", label: "disponible" },
    rented: { bg: "#1e1b4b", color: "#a5b4fc", label: "alquilado" },
    maintenance: { bg: "#431407", color: "#fb923c", label: "mantenimiento" },
    active: { bg: "#052e16", color: "#4ade80", label: "activa" },
    suspended: { bg: "#450a0a", color: "#f87171", label: "suspendida" },
    returned: { bg: "#1c1917", color: "#78716c", label: "devuelto" },
    late: { bg: "#450a0a", color: "#f87171", label: "tarde" },
  };
  const s = map[status] || { bg: "#1f2937", color: "#9ca3af", label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
    }}>{s.label}</span>
  );
}

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} style={{ padding: "12px 16px" }}>
          <div style={{ height: 14, background: "#1f2937", borderRadius: 4, width: i === 0 ? "40%" : "70%", animation: "shimmer 1.5s infinite" }} />
        </td>
      ))}
    </tr>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function SecondSeasonAdmin() {
  const [tab, setTab] = useState("dashboard");
  const db = useDatabase();
  const { loaded: dresses, loading: loadingDresses } = useDataLoad(DB_DRESSES, 1100);
  const { loaded: users, loading: loadingUsers } = useDataLoad(DB_USERS, 1300);
  const { loaded: orders, loading: loadingOrders } = useDataLoad(DB_ORDERS, 900);

  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const activeOrders = orders.filter(o => o.status === "active").length;
  const availableDresses = dresses.filter(d => d.status === "available").length;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "dresses", label: "Vestidos", icon: "👗" },
    { id: "users", label: "Usuarias", icon: "👤" },
    { id: "orders", label: "Pedidos", icon: "📦" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e5e7eb",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        tr { animation: fadeIn 0.3s ease forwards; }
        table { border-collapse: collapse; width: 100%; }
        th { text-align: left; }
        tbody tr:hover { background: #111827 !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1f2937",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0d0d15",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>👗</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            background: "linear-gradient(135deg, #f5d0a9, #c9956c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Second Season</span>
          <span style={{
            background: "#1f2937",
            color: "#9ca3af",
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            fontFamily: "monospace",
            letterSpacing: 1,
          }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280" }}>
          <Pulse color={db.connected ? "#22c55e" : "#facc15"} />
          <span style={{ fontFamily: "monospace" }}>
            {db.connecting ? "connecting..." : `DB · ${db.ping}ms`}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 61px)" }}>

        {/* Sidebar */}
        <div style={{
          width: 200,
          background: "#0d0d15",
          borderRight: "1px solid #1f2937",
          padding: "24px 12px",
          flexShrink: 0,
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: tab === t.id ? "#1f2937" : "transparent",
                color: tab === t.id ? "#f5d0a9" : "#6b7280",
                fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer",
                marginBottom: 4,
                textAlign: "left",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}

          {/* DB info in sidebar */}
          <div style={{
            marginTop: "auto",
            paddingTop: 24,
            borderTop: "1px solid #1f2937",
            marginTop: 32,
          }}>
            <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", lineHeight: 1.8 }}>
              <div style={{ color: "#6b7280", marginBottom: 6, fontSize: 11 }}>BASE DE DATOS</div>
              <div>db.secondseason.es</div>
              <div>puerto: <span style={{ color: "#9ca3af" }}>5432</span></div>
              <div>engine: <span style={{ color: "#9ca3af" }}>PostgreSQL</span></div>
              <div>schema: <span style={{ color: "#9ca3af" }}>v2.1</span></div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowX: "auto" }}>

          <DBStatusBar {...db} />

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
                Panel General
              </h1>

              {/* Stat cards */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                <StatCard icon="💰" label="Ingresos totales" value={`€${totalRevenue}`} sub="acumulado histórico" color="#4ade80" loading={loadingOrders} />
                <StatCard icon="📦" label="Pedidos activos" value={activeOrders} sub="en curso ahora" color="#60a5fa" loading={loadingOrders} />
                <StatCard icon="👗" label="Vestidos disponibles" value={availableDresses} sub={`de ${dresses.length} en catálogo`} color="#f5d0a9" loading={loadingDresses} />
                <StatCard icon="👤" label="Usuarias registradas" value={users.length} sub="en la plataforma" color="#c084fc" loading={loadingUsers} />
              </div>

              {/* Recent orders mini table */}
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "monospace", color: "#4b5563" }}>SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f2937" }}>
                        {["ID", "Usuaria", "Vestido", "Fecha", "Importe", "Estado"].map(h => (
                          <th key={h} style={{ padding: "8px 16px", fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOrders
                        ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)
                        : orders.slice(0, 5).map(o => (
                          <tr key={o.id} style={{ borderBottom: "1px solid #1f2937" }}>
                            <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, color: "#9ca3af" }}>{o.id}</td>
                            <td style={{ padding: "10px 16px", fontSize: 13 }}>{o.user}</td>
                            <td style={{ padding: "10px 16px", fontSize: 13, color: "#d1d5db" }}>{o.dress}</td>
                            <td style={{ padding: "10px 16px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{o.date}</td>
                            <td style={{ padding: "10px 16px", fontFamily: "monospace", color: "#4ade80" }}>€{o.amount}</td>
                            <td style={{ padding: "10px 16px" }}><StatusBadge status={o.status} /></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── DRESSES ── */}
          {tab === "dresses" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Catálogo de Vestidos</h1>
              <p style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace", marginBottom: 20 }}>SELECT * FROM dresses ORDER BY id ASC;</p>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f2937", background: "#0d0d15" }}>
                        {["ID", "Nombre", "Categoría", "Talla", "Stock", "Precio/día", "Alquileres", "Estado"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingDresses
                        ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} cols={8} />)
                        : dresses.map(d => (
                          <tr key={d.id} style={{ borderBottom: "1px solid #1f2937" }}>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{d.id}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18 }}>{d.img}</span>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{d.category}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12 }}>{d.size}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", color: d.stock === 0 ? "#ef4444" : "#4ade80" }}>{d.stock}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#f5d0a9" }}>€{d.price}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#60a5fa" }}>{d.rentals}</td>
                            <td style={{ padding: "12px 16px" }}><StatusBadge status={d.status} /></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Usuarias</h1>
              <p style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace", marginBottom: 20 }}>SELECT * FROM users ORDER BY joined_at DESC;</p>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f2937", background: "#0d0d15" }}>
                        {["ID", "Nombre", "Email", "Registrada", "Alquileres", "Gasto total", "Estado"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers
                        ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)
                        : users.map(u => (
                          <tr key={u.id} style={{ borderBottom: "1px solid #1f2937" }}>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{u.id}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500 }}>{u.name}</td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{u.email}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#9ca3af" }}>{u.joined}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#60a5fa" }}>{u.rentals}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#4ade80" }}>€{u.spent}</td>
                            <td style={{ padding: "12px 16px" }}><StatusBadge status={u.status} /></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Pedidos</h1>
              <p style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace", marginBottom: 20 }}>SELECT orders.*, users.name, dresses.name FROM orders JOIN users JOIN dresses ORDER BY date DESC;</p>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f2937", background: "#0d0d15" }}>
                        {["ID Pedido", "Usuaria", "Vestido", "Fecha inicio", "Devolución", "Importe", "Estado"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOrders
                        ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)
                        : orders.map(o => (
                          <tr key={o.id} style={{ borderBottom: "1px solid #1f2937" }}>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#9ca3af" }}>{o.id}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13 }}>{o.user}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "#d1d5db" }}>{o.dress}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{o.date}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{o.return}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#4ade80" }}>€{o.amount}</td>
                            <td style={{ padding: "12px 16px" }}><StatusBadge status={o.status} /></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
