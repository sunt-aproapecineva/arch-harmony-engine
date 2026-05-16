import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Lock, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

type Mod = { id: string; title: string; subtitle: string | null; etapa: string | null; saptamana: string | null; order_index: number };
type Lesson = { id: string; module_id: string; title: string; duration_min: number | null; order_index: number };

function Dashboard() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Mod[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, l, p] = await Promise.all([
        supabase.from("modules").select("*").order("order_index"),
        supabase.from("lessons").select("id, module_id, title, duration_min, order_index").order("order_index"),
        supabase.from("progress").select("lesson_id").eq("user_id", user!.id),
      ]);
      setModules(m.data ?? []);
      setLessons(l.data ?? []);
      setDone(new Set((p.data ?? []).map((r) => r.lesson_id)));
      setLoading(false);
    })();
  }, [user]);

  const lessonsByModule = (mid: string) => lessons.filter((l) => l.module_id === mid);
  const moduleProgress = (mid: string) => {
    const ls = lessonsByModule(mid);
    if (!ls.length) return 0;
    return Math.round((ls.filter((l) => done.has(l.id)).length / ls.length) * 100);
  };
  const totalLessons = lessons.length;
  const completedTotal = lessons.filter((l) => done.has(l.id)).length;
  const overallPct = totalLessons ? Math.round((completedTotal / totalLessons) * 100) : 0;

  const isModuleUnlocked = (idx: number) => {
    if (idx === 0) return true;
    const prev = modules[idx - 1];
    return prev && moduleProgress(prev.id) === 100;
  };

  if (loading) return <div className="spinner" style={{ color: "var(--accent)" }} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome + overall progress */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }} className="dashboard-top">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 28 }}>
          <div style={{ fontSize: 12, color: "var(--fg-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Bun venit</div>
          <h1 className="font-aboreto" style={{ fontSize: 32, color: "var(--fg)", lineHeight: 1.1, marginBottom: 12, letterSpacing: "-0.01em" }}>
            {user?.full_name?.split(" ")[0] || "Constructor"}.
          </h1>
          <p style={{ color: "var(--fg-2)", fontSize: 14, maxWidth: 540 }}>
            {completedTotal === 0
              ? "Hai să construim prima etapă. Deschide Modulul 0 pentru a începe diagnosticul."
              : completedTotal === totalLessons
              ? "Ai finalizat practicumul. Felicitări — afacerea ta are acum o arhitectură reală."
              : `Ești în curs. ${completedTotal} din ${totalLessons} lecții finalizate.`}
          </p>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <ProgressRing pct={overallPct} />
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Progres total</div>
        </motion.div>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="font-aboreto" style={{ fontSize: 18, color: "var(--fg)", marginBottom: 16, letterSpacing: "0.04em" }}>
          Cele 7 module
        </h2>
        <div className="module-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {modules.map((m, i) => {
            const pct = moduleProgress(m.id);
            const unlocked = isModuleUnlocked(i);
            const status = !unlocked ? "locked" : pct === 100 ? "done" : pct > 0 ? "active" : "todo";
            const borderColor = status === "locked" ? "var(--gold)" : status === "done" ? "#4ade80" : "var(--accent)";
            const count = lessonsByModule(m.id).length;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                whileHover={unlocked ? { scale: 1.012 } : {}}
                className="glass-card"
                style={{ padding: 22, position: "relative", overflow: "hidden", borderLeft: `3px solid ${borderColor}`, opacity: unlocked ? 1 : 0.55 }}
              >
                <div className="stage-watermark" style={{ right: -20, top: -30 }}>{i}</div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                    {m.etapa} · {m.saptamana}
                  </div>
                  <h3 className="font-aboreto" style={{ fontSize: 17, color: "var(--fg)", lineHeight: 1.25, marginBottom: 8, letterSpacing: "0.02em" }}>
                    {m.title}
                  </h3>
                  {m.subtitle && <p style={{ fontSize: 13, color: "var(--fg-3)", lineHeight: 1.55, marginBottom: 16, fontStyle: "italic" }}>{m.subtitle}</p>}

                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--fg-3)", marginBottom: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><BookOpen size={12} /> {count} lecții</span>
                    {status === "done" && <span style={{ color: "#4ade80", display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12} /> Completat</span>}
                    {status === "active" && <span style={{ color: "var(--accent)" }}>În curs · {pct}%</span>}
                    {status === "locked" && <span style={{ color: "var(--gold)", display: "inline-flex", alignItems: "center", gap: 4 }}><Lock size={11} /> Blocat</span>}
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 16 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>

                  {unlocked ? (
                    <Link to="/module/$moduleId" params={{ moduleId: m.id }} style={{
                      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
                      color: "var(--accent)", padding: "6px 0",
                    }}>
                      {pct === 0 ? "Începe modulul" : pct === 100 ? "Revizuiește" : "Continuă"} <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--gold)" }}>
                      Finalizează „{modules[i - 1]?.title}" pentru a debloca
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle cx={60} cy={60} r={r} stroke="var(--border)" strokeWidth={6} fill="none" />
      <motion.circle
        cx={60} cy={60} r={r}
        stroke="var(--accent)" strokeWidth={6} fill="none" strokeLinecap="round"
        transform="rotate(-90 60 60)"
        initial={{ strokeDasharray: c, strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct / 100) }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ strokeDasharray: c }}
      />
      <text x={60} y={66} textAnchor="middle" className="font-aboreto" style={{ fontSize: 22, fill: "var(--fg)" }}>{pct}%</text>
    </svg>
  );
}
