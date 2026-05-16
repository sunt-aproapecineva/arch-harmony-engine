import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { BrandPanel, Field } from "./login";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Înregistrare · Arhitectura Afacerii" }] }),
});

function RegisterPage() {
  const [step, setStep] = useState<"email" | "details">("email");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  async function checkEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const { data } = await supabase.from("whitelist").select("email").eq("email", email.trim()).maybeSingle();
    setLoading(false);
    if (!data) {
      setErr("Email-ul nu este pe lista de acces. Contactează organizatorul.");
      return;
    }
    setStep("details");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    if (error) { setLoading(false); setErr(error); return; }
    const r = await signIn(email.trim(), password);
    setLoading(false);
    if (r.error) setErr(r.error);
    else navigate({ to: "/dashboard" });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <BrandPanel />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: "100%", maxWidth: 380 }}>
          <h1 className="font-aboreto" style={{ fontSize: 26, color: "var(--fg)", marginBottom: 8, letterSpacing: "0.04em" }}>Creează cont</h1>
          <p style={{ fontSize: 14, color: "var(--fg-3)", marginBottom: 28 }}>
            {step === "email" ? "Verificăm dacă email-ul tău e pe lista de acces." : "Email confirmat. Hai să configurăm contul."}
          </p>

          {step === "email" ? (
            <form onSubmit={checkEmail} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Email invitat" icon={<Mail size={15} />}>
                <input className="aa-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplu.ro" style={{ paddingLeft: 38 }} />
              </Field>
              {err && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>{err}</div>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Verific..." : <>Verifică email <ArrowRight size={15} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(196,240,228,0.08)", border: "1px solid rgba(196,240,228,0.2)", borderRadius: 8, fontSize: 13, color: "var(--fg-2)" }}>
                <CheckCircle2 size={15} style={{ color: "var(--accent)" }} /> {email}
              </div>
              <Field label="Nume complet" icon={<User size={15} />}>
                <input className="aa-input" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Numele tău" style={{ paddingLeft: 38 }} />
              </Field>
              <Field label="Parolă (min. 6 caractere)" icon={<Lock size={15} />}>
                <input className="aa-input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingLeft: 38 }} />
              </Field>
              {err && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>{err}</div>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Se creează..." : <>Creează cont <ArrowRight size={15} /></>}
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, fontSize: 13, color: "var(--fg-3)" }}>
            Ai deja cont? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Intră în cont</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
