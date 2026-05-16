import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Intră în cont · Arhitectura Afacerii" }] }),
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setErr(error);
    else navigate({ to: "/dashboard" });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <BrandPanel />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: "100%", maxWidth: 380 }}>
          <h1 className="font-aboreto" style={{ fontSize: 26, color: "var(--fg)", marginBottom: 8, letterSpacing: "0.04em" }}>Intră în cont</h1>
          <p style={{ fontSize: 14, color: "var(--fg-3)", marginBottom: 28 }}>Acces restricționat — doar pentru participanți.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Email" icon={<Mail size={15} />}>
              <input className="aa-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplu.ro" style={{ paddingLeft: 38 }} />
            </Field>
            <Field label="Parolă" icon={<Lock size={15} />}>
              <input className="aa-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingLeft: 38 }} />
            </Field>
            {err && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>{err}</motion.div>
            )}
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Se încarcă..." : <>Intră în cont <ArrowRight size={15} /></>}
            </button>
          </form>
          <div className="glass-accent" style={{ marginTop: 24, padding: "14px 16px" }}>
            <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 8, fontWeight: 500 }}>Ai primit invitație la platformă?</p>
            <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--accent)", color: "#0D0907", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              Creează cont cu email-ul invitat <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function BrandPanel() {
  return (
    <div className="hidden md:flex" style={{
      width: "42%", background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)",
      flexDirection: "column", justifyContent: "space-between", padding: "48px 40px",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1A5C38, #0f3d22)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(26,92,56,0.35)" }}>
            <span className="font-aboreto" style={{ fontSize: 12, color: "#C4F0E4" }}>AA</span>
          </div>
          <span className="font-aboreto" style={{ fontSize: 13, letterSpacing: "0.12em", color: "var(--fg)" }}>ARHITECTURA AFACERII</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-aboreto" style={{ fontSize: "clamp(2rem,3.5vw,3.2rem)", color: "var(--fg)", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Construiește afacerea<br />care <span style={{ color: "var(--accent)" }}>funcționează</span><br />fără tine.
          </h2>
          <p style={{ fontSize: 14, color: "var(--fg-3)", lineHeight: 1.7, maxWidth: 320 }}>
            Practicum de sistematizare · 8 săptămâni · 6 etape · Victor Morar
          </p>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: "flex", gap: 24 }}>
        {[["6", "Etape"], ["8", "Săptămâni"], ["100%", "Livrabile reale"]].map(([v, l]) => (
          <div key={l}>
            <div className="font-aboreto" style={{ fontSize: 24, color: "var(--accent)", lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--fg-2)", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--fg-3)", pointerEvents: "none", zIndex: 1 }}>{icon}</div>
        {children}
      </div>
    </div>
  );
}
