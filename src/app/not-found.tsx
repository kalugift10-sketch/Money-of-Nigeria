import Link from "next/link";

export const metadata = { title: "Page not found · The Money Of Nigeria" };

export default function NotFound() {
  return (
    <div className="wrap" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "80px var(--pad)" }}>
      <p className="label">404</p>
      <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05 }}>This money isn’t in the directory.</h1>
      <p style={{ color: "var(--body)", fontWeight: 300, fontSize: 18 }}>The page may have moved, or the link is wrong.</p>
      <p style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 8 }}>
        <Link href="/" style={{ color: "var(--brand)", textDecoration: "underline", textUnderlineOffset: 4 }}>See all money</Link>
        <Link href="/sources" style={{ color: "var(--brand)", textDecoration: "underline", textUnderlineOffset: 4 }}>Sources</Link>
      </p>
    </div>
  );
}
