import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Clock, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/module/$moduleId")({ component: ModulePage });

type Mod = { id: string; title: string; subtitle: string | null; description: string | null; etapa: string | null; saptamana: string | null; order_index: number };
type Lesson = { id: string; title: string; description: string | null; duration_min: number | null; order_index: number };
type Exercise = { id: string; title: string; description: string | null; order_index: number };

function ModulePage() {
  const { moduleId } = useParams({ from: "/_app/module/$moduleId" });
  const { user } = useAuth();
  const [mod, setMod] = useState<Mod | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [m, l, e, p] = await Promise.all([
        supabase.from("modules").select("*").eq("id", moduleId).maybeSingle(),
        supabase.from("lessons").select("*").eq("module_id", moduleId).order("order_index"),
        supabase.from("exercises").select("*").eq("module_id", moduleId).order("order_index"),
        supabase.from("progress").select("lesson_id").eq("user_id", user!.id),
      ]);
      setMod(m.data as Mod | null);
      setLessons(l.data ?? []);
      setExercises(e.data ?? []);
      setDone(new Set((p.data ?? []).map((r) => r.lesson_id)));
    })();
  }, [moduleId, user]);

  async function toggle(lid: string) {
    if (done.has(lid)) {
      await supabase.from("progress").delete().eq("user_id", user!.id).eq("lesson_id", lid);
      const n = new Set(done); n.delete(lid); setDone(n);
    } else {
      await supabase.from("progress").insert({ user_id: user!.id, lesson_id: lid });
      setDone(new Set(done).add(lid));
    }
  }

  if (!mod) return <div className="spinner" style={{ color: "var(--accent)" }} />;

  const pct = lessons.length ? Math.round((lessons.filter((l) => done.has(l.id)).length / lessons.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--fg-3)", width: "fit-content" }}>
        <ArrowLeft size={14} /> Înapoi la dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32, position: "relative", overflow: "hidden" }}>
        <div className="stage-watermark" style={{ right: -10, top: -40, fontSize: 220 }}>{mod.order_index}</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{mod.etapa} · {mod.saptamana}</div>
          <h1 className="font-aboreto" style={{ fontSize: 34, color: "var(--fg)", letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 12 }}>{mod.title}</h1>
          {mod.subtitle && <p style={{ fontSize: 16, color: "var(--accent)", fontStyle: "italic", marginBottom: 12 }}>{mod.subtitle}</p>}
          {mod.description && <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.7, maxWidth: 720 }}>{mod.description}</p>}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, maxWidth: 280 }} className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span style={{ fontSize: 13, color: "var(--fg-2)", fontWeight: 600 }}>{pct}%</span>
          </div>
        </div>
      </motion.div>

      <div>
        <h2 className="font-aboreto" style={{ fontSize: 16, color: "var(--fg)", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>Lecții</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lessons.map((l, i) => {
            const isDone = done.has(l.id);
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                className="glass-card"
                style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}
              >
                <button onClick={() => toggle(l.id)} style={{ background: "none", border: "none", cursor: "pointer", color: isDone ? "var(--accent)" : "var(--fg-3)" }}>
                  {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <Link to="/lesson/$lessonId" params={{ lessonId: l.id }} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                    <Play size={14} fill="currentColor" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 500, textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.6 : 1 }}>
                      {String(i).padStart(2, "0")}. {l.title}
                    </div>
                  </div>
                  {l.duration_min && (
                    <div style={{ fontSize: 12, color: "var(--fg-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} /> {l.duration_min} min
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {exercises.length > 0 && (
        <div>
          <h2 className="font-aboreto" style={{ fontSize: 16, color: "var(--fg)", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>Exerciții practice</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {exercises.map((ex, i) => (
              <motion.div key={ex.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }} className="glass-card" style={{ padding: 18, display: "flex", gap: 14 }}>
                <div className="font-aboreto" style={{ fontSize: 22, color: "var(--gold)", width: 32, flexShrink: 0 }}>{i + 1}.</div>
                <div>
                  <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 600, marginBottom: 4 }}>{ex.title}</div>
                  {ex.description && <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.65 }}>{ex.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
