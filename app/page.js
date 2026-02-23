export default function HomePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";

  return (
    <main style={{ minHeight: "100vh", background: "#f9fafb", color: "#111827" }}>
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 20px",
          position: "sticky",
          top: 0
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700 }}>Task Manager</div>
          <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
            <a href="/api/health" style={{ color: "#3b82f6", textDecoration: "none" }}>Health</a>
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
        <h1 style={{ fontSize: 24, margin: "16px 0" }}>Frontend running from repo root</h1>
        <p style={{ margin: "0 0 16px 0", color: "#475569" }}>
          This is a minimal Next.js app scaffold running from the repository root.
        </p>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Detected env (public)</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155" }}>
            <li><strong>NEXT_PUBLIC_API_BASE</strong>: {apiBase || <em>(not set)</em>}</li>
            <li><strong>NEXT_PUBLIC_BACKEND_URL</strong>: {backendUrl || <em>(not set)</em>}</li>
            <li><strong>NEXT_PUBLIC_WS_URL</strong>: {wsUrl || <em>(not set)</em>}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
