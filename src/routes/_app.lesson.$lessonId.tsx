import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/lesson/$lessonId")({ component: LessonPage });

type Lesson = { id: string; module_id: string; title: string; description: string | null; video_url: string | null; pdf_url: string | null; duration_min: number | null; order_index: number };

function LessonPage() {
  const { lessonId } = useParams({ from: "/_app/lesson/$lessonId" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [siblings, setSiblings] = useState<Lesson[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");

  useEffect(() => {
    (async () => {
      const { data: l } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
      if (!l) return;
      setLesson(l as Lesson);
      const [{ data: sibs }, { data: prog }, { data: mod }] = await Promise.all([
        supabase.from("lessons").select("*").eq("module_id", l.module_id).order("order_index"),
        supabase.from("progress").select("lesson_id").eq("user_id", user!.id).eq("lesson_id", lessonId).maybeSingle(),
        supabase.from("modules").select("title").eq("id", l.module_id).maybeSingle(),
      ]);
      setSiblings(sibs ?? []);
      setIsDone(!!prog);
      setModuleTitle(mod?.title ?? "");
    })();
  }, [lessonId, user]);

  async function markComplete() {
    if (!user || !lesson) return;
    if (isDone) {
      await supabase.from("progress").delete().eq("user_id", user.id).eq("lesson_id", lesson.id);
      setIsDone(false);
    } else {
      await supabase.from("progress").insert({ user_id: user.id, lesson_id: lesson.id });
      setIsDone(true);
    }
  }

  if (!lesson) return <div className="spinner" style={{ color: "var(--accent)" }} />;

  const idx = siblings.findIndex((s) => s.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  // YouTube embed normalization
  let embedUrl = lesson.video_url;
  if (embedUrl && embedUrl.includes("watch?v=")) {
    embedUrl = embedUrl.replace("watch?v=", "embed/");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }} className="lesson-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Link to="/module/$moduleId" params={{ moduleId: lesson.module_id }} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--fg-3)", width: "fit-content" }}>
          <ArrowLeft size={14} /> Înapoi la {moduleTitle || "modul"}
        </Link>

        <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              width="100%" height="100%"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0, display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-3)", fontSize: 13 }}>
              Video-ul va fi adăugat în curând.
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24 }}>
          <h1 className="font-aboreto" style={{ fontSize: 26, color: "var(--fg)", letterSpacing: "0.02em", lineHeight: 1.2, marginBottom: 10 }}>
            {lesson.title}
          </h1>
          {lesson.duration_min && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--fg-3)", marginBottom: 12 }}>
              <Clock size={12} /> {lesson.duration_min} minute
            </div>
          )}
          {lesson.description && <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.75 }}>{lesson.description}</p>}

          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {lesson.pdf_url && (
              <a href={lesson.pdf_url} target="_blank" rel="noreferrer" className="btn-resource">
                <Download size={13} /> Descarcă PDF
              </a>
            )}
            <button onClick={markComplete} className="btn-primary" style={{ background: isDone ? "#4ade80" : "var(--accent)" }}>
              <CheckCircle2 size={15} /> {isDone ? "Finalizată" : "Marchează ca finalizată"}
            </button>
          </div>
        </motion.div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          {prev ? (
            <button onClick={() => navigate({ to: "/lesson/$lessonId", params: { lessonId: prev.id } })} className="btn-ghost">
              <ArrowLeft size={14} /> {prev.title}
            </button>
          ) : <div />}
          {next ? (
            <button onClick={() => navigate({ to: "/lesson/$lessonId", params: { lessonId: next.id } })} className="btn-ghost">
              {next.title} <ArrowRight size={14} />
            </button>
          ) : <div />}
        </div>
      </div>

      <aside className="glass-card" style={{ padding: 18, height: "fit-content", position: "sticky", top: 90 }}>
        <div style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Lecții în modul</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {siblings.map((s, i) => (
            <Link
              key={s.id}
              to="/lesson/$lessonId"
              params={{ lessonId: s.id }}
              style={{
                padding: "9px 12px", borderRadius: 8, fontSize: 13,
                color: s.id === lesson.id ? "var(--fg)" : "var(--fg-3)",
                background: s.id === lesson.id ? "var(--bg-3)" : "transparent",
                fontWeight: s.id === lesson.id ? 600 : 400,
                display: "block",
              }}
            >
              {String(i).padStart(2, "0")} · {s.title}
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
