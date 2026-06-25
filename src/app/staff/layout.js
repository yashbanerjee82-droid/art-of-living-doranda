import Link from "next/link";

export default function StaffLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "white", padding: "1rem 2rem", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600, color: "var(--color-sunrise-orange)" }}>
          <Link href="/">AOL Doranda Portal</Link>
        </div>
      </header>
      <main style={{ flex: 1, padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
