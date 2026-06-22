// Pure deterministic scoring for student profile (client+server safe).
// No supabase/network imports here.

export interface ScoringInput {
  // All MODULES from src/lib/data.ts (or admin lessons)
  totalLessons: number;             // number of video lessons (lessons.length)
  totalExercises: number;           // sum of mod.exercises[]
  // What the student did:
  completedLessonIds: string[];     // from public.progress
  exerciseResponses: Record<string, unknown>; // exerciseId -> response (jsonb)
  notesCount: number;               // number of lesson_notes rows with non-empty content
  activityTimestamps: string[];     // ISO timestamps from activity_log (most recent first OK)
  quizDone: boolean;
}

export interface StudentScores {
  engagement: number;     // 0-100
  understanding: number;  // 0-100
  consistency: number;    // 0-100
  overall: number;        // 0-100 (weighted average)
  lessonsCompleted: number;
  lessonsTotal: number;
  exercisesAttempted: number;
  exercisesQuality: number; // 0-100, average quality of attempted responses
  exercisesTotal: number;
  notesCount: number;
  activeDays30: number;
  lastActiveAt: string | null;
  daysSinceLastActive: number | null;
  status: 'active' | 'slow' | 'stuck' | 'inactive' | 'done' | 'new';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function quantifyResponseQuality(value: unknown): number {
  // returns 0..1 based on "depth" of the answer
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return 0;
    if (t.length < 15) return 0.25;
    if (t.length < 60) return 0.55;
    if (t.length < 200) return 0.8;
    return 1;
  }
  if (typeof value === 'number') return 0.6;
  if (typeof value === 'boolean') return value ? 0.5 : 0;
  if (Array.isArray(value)) {
    const filled = value.filter(v => quantifyResponseQuality(v) > 0);
    if (filled.length === 0) return 0;
    const avg = filled.reduce((s, v) => s + quantifyResponseQuality(v), 0) / filled.length;
    // bonus for multiple rows
    return Math.min(1, avg * (0.5 + Math.min(0.5, filled.length / 6)));
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // dynamic table { rows, conclusion }
    if (Array.isArray((obj as any).rows)) {
      const rows = (obj as any).rows as unknown[];
      const conclusion = typeof (obj as any).conclusion === 'string' ? (obj as any).conclusion : '';
      const rowsScore = quantifyResponseQuality(rows);
      const conclScore = quantifyResponseQuality(conclusion);
      return Math.min(1, rowsScore * 0.7 + conclScore * 0.3 + (rows.length > 0 ? 0.1 : 0));
    }
    const entries = Object.entries(obj);
    if (entries.length === 0) return 0;
    // All boolean (checklist)
    if (entries.every(([, v]) => typeof v === 'boolean')) {
      const checked = entries.filter(([, v]) => v === true).length;
      return checked / entries.length;
    }
    // All numeric (diagnostic-grid)
    if (entries.every(([, v]) => typeof v === 'number')) {
      const nums = entries.map(([, v]) => v as number);
      const avg = nums.reduce((s, n) => s + n, 0) / nums.length;
      return Math.min(1, avg / 5); // assume 1..5 scale
    }
    // Mixed key/value (form fields)
    const scores = entries.map(([, v]) => quantifyResponseQuality(v));
    return scores.reduce((s, x) => s + x, 0) / scores.length;
  }
  return 0;
}

export function computeScores(input: ScoringInput): StudentScores {
  const lessonsCompleted = input.completedLessonIds.length;
  const lessonsTotal = Math.max(0, input.totalLessons);
  const exerciseEntries = Object.entries(input.exerciseResponses);
  const exercisesAttempted = exerciseEntries.filter(([, v]) => quantifyResponseQuality(v) > 0).length;
  const exercisesTotal = Math.max(0, input.totalExercises);

  // Active days in last 30
  const now = Date.now();
  const days = new Set<string>();
  let lastActiveTs: number | null = null;
  for (const iso of input.activityTimestamps) {
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) continue;
    if (lastActiveTs === null || t > lastActiveTs) lastActiveTs = t;
    if (now - t <= 30 * 86400000) {
      days.add(new Date(t).toISOString().slice(0, 10));
    }
  }
  const activeDays30 = days.size;
  const daysSinceLastActive = lastActiveTs ? Math.floor((now - lastActiveTs) / 86400000) : null;

  // ── Engagement ────────────────────────────────────────────────────────────
  // 40% lessons completed, 30% exercises attempted, 15% notes, 15% quiz done
  const lessonPct = lessonsTotal > 0 ? lessonsCompleted / lessonsTotal : 0;
  const exPct = exercisesTotal > 0 ? exercisesAttempted / exercisesTotal : 0;
  const notesPct = Math.min(1, input.notesCount / Math.max(1, Math.round(lessonsTotal / 3)));
  const quizPct = input.quizDone ? 1 : 0;
  const engagement = Math.round((lessonPct * 0.4 + exPct * 0.3 + notesPct * 0.15 + quizPct * 0.15) * 100);

  // ── Understanding ─────────────────────────────────────────────────────────
  // average quality of all attempted exercise responses, scaled to 100
  let qualityAvg = 0;
  if (exerciseEntries.length > 0) {
    const qualities = exerciseEntries.map(([, v]) => quantifyResponseQuality(v));
    const attempted = qualities.filter(q => q > 0);
    qualityAvg = attempted.length > 0 ? attempted.reduce((s, q) => s + q, 0) / attempted.length : 0;
  }
  const understanding = Math.round(qualityAvg * 100);

  // ── Consistency ───────────────────────────────────────────────────────────
  // active days in last 30, where 12+ days = 100%
  const consistency = Math.min(100, Math.round((activeDays30 / 12) * 100));

  // ── Overall ───────────────────────────────────────────────────────────────
  // Engagement 50, Understanding 30, Consistency 20
  const overall = Math.round(engagement * 0.5 + understanding * 0.3 + consistency * 0.2);

  // ── Status ────────────────────────────────────────────────────────────────
  let status: StudentScores['status'] = 'new';
  const totalItems = lessonsTotal + exercisesTotal;
  const doneItems = lessonsCompleted + exercisesAttempted;

  if (totalItems > 0 && doneItems === 0 && (daysSinceLastActive === null || daysSinceLastActive > 14)) {
    status = 'new';
  } else if (totalItems > 0 && doneItems / totalItems >= 0.95) {
    status = 'done';
  } else if (daysSinceLastActive !== null && daysSinceLastActive >= 14) {
    status = 'inactive';
  } else if (daysSinceLastActive !== null && daysSinceLastActive >= 7) {
    status = 'stuck';
  } else if (engagement < 25) {
    status = 'slow';
  } else {
    status = 'active';
  }

  return {
    engagement,
    understanding,
    consistency,
    overall,
    lessonsCompleted,
    lessonsTotal,
    exercisesAttempted,
    exercisesQuality: Math.round(qualityAvg * 100),
    exercisesTotal,
    notesCount: input.notesCount,
    activeDays30,
    lastActiveAt: lastActiveTs ? new Date(lastActiveTs).toISOString() : null,
    daysSinceLastActive,
    status,
  };
}

export const STATUS_LABEL: Record<StudentScores['status'], string> = {
  active: 'Pe drum',
  slow: 'Lent',
  stuck: 'Blocat',
  inactive: 'Inactiv',
  done: 'Finalizat',
  new: 'Neînceput',
};

export const STATUS_COLOR: Record<StudentScores['status'], string> = {
  active: '#4ade80',
  slow: '#fbbf24',
  stuck: '#fb923c',
  inactive: '#f87171',
  done: '#86efac',
  new: 'var(--fg-3)',
};

// Identify "stuck at module X": the lowest-index module that has any started work but isn't finished.
export function detectStuckModule(
  mods: Array<{ id: string; etapa?: string | null; title?: string | null; lessons: { id: string }[]; exercises?: { id: string }[] }>,
  completedLessonIds: string[],
  exerciseResponses: Record<string, unknown>,
): { id: string; label: string } | null {
  const completedLessons = new Set(completedLessonIds);
  for (const m of mods) {
    const lessonsTotal = m.lessons.length;
    const exsTotal = m.exercises?.length || 0;
    const lessonsDone = m.lessons.filter(l => completedLessons.has(l.id)).length;
    const exsDone = (m.exercises || []).filter(e => quantifyResponseQuality(exerciseResponses[e.id]) > 0).length;
    const total = lessonsTotal + exsTotal;
    const done = lessonsDone + exsDone;
    if (total === 0) continue;
    if (done === 0) continue; // hasn't started this module yet
    if (done < total) {
      return { id: m.id, label: `${m.etapa || ''} — ${m.title || m.id}`.trim() };
    }
  }
  return null;
}
