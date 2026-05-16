import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, UserPlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/_app/admin")({
  component: () => (<RequireAuth adminOnly><AdminDashboard /></RequireAuth>),
});

type WhitelistEntry = { id: string; email: string; added_at: string | null };
type Profile = { id: string; email: string; full_name: string | null };

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, lessons: 0, completions: 0 });
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    const [u, l, p, wl, pr] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("progress").select("*", { count: "exact", head: true }),
      supabase.from("whitelist").select("*").order("added_at", { ascending: false }),
      supabase.from("profiles").select("id, email, full_name").order("created_at", { ascending: false }),
    ]);
    setStats({ users: u.count ?? 0, lessons: l.count ?? 0, completions: p.count ?? 0 });
    setWhitelist(wl.data ?? []);
    setProfiles(pr.data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function addWhitelist(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    await supabase.from("whitelist").insert({ email: newEmail.trim().toLowerCase() });
    setNewEmail("");
    setAdding(false);
    load();
  }

  async function removeWhitelist(id: string) {
    if (!confirm("Sigur vrei să elimini acest email?")) return;
    await supabase.from("whitelist").delete().eq("id", id);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 className="font-aboreto" style={{ fontSize: 28, color: "var(--fg)", letterSpacing: "0.02em", marginBottom: 6 }}>Admin</h1>
        <p style={{ fontSize: 14, color: "var(--fg-3)" }}>Vedere generală a platformei și gestionarea accesului.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <StatCard icon={<Users size={16} />} label="Participanți" value={stats.users} />
        <StatCard icon={<BookOpen size={16} />} label="Lecții publicate" value={stats.lessons} />
        <StatCard icon={<TrendingUp size={16} />} label="Lecții finalizate (total)" value={stats.completions} />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24 }}>
        <h2 className="font-aboreto" style={{ fontSize: 16, color: "var(--fg)", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Whitelist</h2>
        <form onSubmit={addWhitelist} style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <input className="aa-input" type="email" required placeholder="email@exemplu.ro" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn-primary" disabled={adding}><UserPlus size={14} /> Adaugă</button>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {whitelist.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-3)", borderRadius: 8, fontSize: 13 }}>
              <span style={{ color: "var(--fg-2)" }}>{w.email}</span>
              <button onClick={() => removeWhitelist(w.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-3)", padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {whitelist.length === 0 && <div style={{ color: "var(--fg-3)", fontSize: 13 }}>Niciun email pe whitelist.</div>}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24 }}>
        <h2 className="font-aboreto" style={{ fontSize: 16, color: "var(--fg)", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Participanți înregistrați</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {profiles.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-3)", borderRadius: 8, fontSize: 13 }}>
              <span style={{ color: "var(--fg)" }}>{p.full_name || "—"}</span>
              <span style={{ color: "var(--fg-3)" }}>{p.email}</span>
            </div>
          ))}
          {profiles.length === 0 && <div style={{ color: "var(--fg-3)", fontSize: 13 }}>Niciun participant înregistrat încă.</div>}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {icon} {label}
      </div>
      <div className="font-aboreto" style={{ fontSize: 30, color: "var(--fg)", letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}
