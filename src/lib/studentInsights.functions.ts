// @ts-nocheck
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { computeScores, detectStuckModule, type StudentScores } from './studentScoring';

async function ensureAdmin(ctx: any) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('has_role', { _user_id: ctx.userId, _role: 'admin' });
  if (error || data !== true) throw new Error('Nu ai acces administrativ.');
  return supabaseAdmin;
}

// ── Helpers to collect a student's full footprint ────────────────────────────
async function gatherStudent(admin: any, studentId: string) {
  const [profileRes, progressRes, quizRes, notesRes, exRes, activityRes, modulesRes, lessonsRes, exercisesRes] =
    await Promise.all([
      admin.from('profiles').select('id,email,full_name,tariff,created_at').eq('id', studentId).maybeSingle(),
      admin.from('progress').select('lesson_id,completed_at').eq('user_id', studentId),
      admin.from('quiz_responses').select('answers,completed_at').eq('user_id', studentId).maybeSingle(),
      admin.from('lesson_notes').select('lesson_id,content,updated_at').eq('user_id', studentId),
      admin.from('exercise_responses').select('exercise_id,response,updated_at').eq('user_id', studentId),
      admin.from('activity_log').select('created_at,type,label').eq('user_id', studentId).order('created_at', { ascending: false }).limit(500),
      admin.from('modules').select('id,title,etapa,order_index').order('order_index'),
      admin.from('lessons').select('id,module_id,title,order_index').order('order_index'),
      admin.from('exercises').select('id,module_id,title,order_index').order('order_index'),
    ]);

  if (profileRes.error) throw new Error(profileRes.error.message);
  const profile = profileRes.data;
  if (!profile) throw new Error('Elev inexistent.');

  const modules = (modulesRes.data || []) as any[];
  const lessons = (lessonsRes.data || []) as any[];
  const exercises = (exercisesRes.data || []) as any[];
  const lessonsByMod: Record<string, any[]> = {};
  const exercisesByMod: Record<string, any[]> = {};
  lessons.forEach((l: any) => { (lessonsByMod[l.module_id] ||= []).push(l); });
  exercises.forEach((e: any) => { (exercisesByMod[e.module_id] ||= []).push(e); });
  const mods = modules.map((m: any) => ({
    ...m,
    lessons: lessonsByMod[m.id] || [],
    exercises: exercisesByMod[m.id] || [],
  }));

  const progress = (progressRes.data || []) as any[];
  const quizAnswers = (quizRes.data?.answers || null) as Record<string, any> | null;
  const notes = (notesRes.data || []) as any[];
  const exerciseRows = (exRes.data || []) as any[];
  const activity = (activityRes.data || []) as any[];

  const exerciseResponses: Record<string, unknown> = {};
  exerciseRows.forEach((r: any) => { exerciseResponses[r.exercise_id] = r.response; });

  const completedLessonIds = progress.map((p: any) => p.lesson_id);
  const totalLessons = lessons.length;
  const totalExercises = exercises.length;
  const nonEmptyNotes = notes.filter((n: any) => (n.content || '').trim().length > 5).length;

  const scores: StudentScores = computeScores({
    totalLessons,
    totalExercises,
    completedLessonIds,
    exerciseResponses,
    notesCount: nonEmptyNotes,
    activityTimestamps: activity.map((a: any) => a.created_at),
    quizDone: !!quizAnswers,
  });

  const stuck = detectStuckModule(mods as any, completedLessonIds, exerciseResponses);

  return { profile, mods, progress, quizAnswers, notes, exerciseRows, activity, scores, stuck };
}

// ── getStudentInsightBundle ──────────────────────────────────────────────────
export const getStudentInsightBundle = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ studentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await ensureAdmin(context);
    const gathered = await gatherStudent(admin, data.studentId);
    const { data: insight } = await admin
      .from('student_insights')
      .select('summary,scores,model_used,generated_at,updated_at')
      .eq('user_id', data.studentId)
      .maybeSingle();
    return {
      scores: gathered.scores,
      stuckModule: gathered.stuck,
      cached: insight || null,
    };
  });

// ── generateStudentInsight (AI summary) ──────────────────────────────────────
function buildPrompt(args: {
  profile: any;
  mods: any[];
  quizAnswers: Record<string, any> | null;
  notes: any[];
  exerciseRows: any[];
  progress: any[];
  scores: StudentScores;
  stuck: { id: string; label: string } | null;
}) {
  const { profile, mods, quizAnswers, notes, exerciseRows, scores, stuck } = args;

  const completedLessonIds = new Set(args.progress.map((p: any) => p.lesson_id));
  const moduleBreakdown = mods.map((m: any) => {
    const lessonsDone = m.lessons.filter((l: any) => completedLessonIds.has(l.id)).length;
    const exMap = new Map(exerciseRows.map((r: any) => [r.exercise_id, r.response]));
    const exsAttempted = (m.exercises || []).filter((e: any) => exMap.get(e.id) !== undefined).length;
    return `- ${m.etapa || ''} ${m.title}: ${lessonsDone}/${m.lessons.length} lecții, ${exsAttempted}/${(m.exercises || []).length} exerciții`;
  }).join('\n');

  // Sample exercise responses (truncate long content)
  const exerciseSamples = exerciseRows.slice(0, 12).map((r: any) => {
    const json = JSON.stringify(r.response);
    const truncated = json.length > 700 ? json.slice(0, 700) + '...[trunchiat]' : json;
    return `Exercițiul ${r.exercise_id}: ${truncated}`;
  }).join('\n\n');

  const notesSample = notes.slice(0, 6).map((n: any) => {
    const c = (n.content || '').slice(0, 240);
    return `Lecția ${n.lesson_id}: "${c}${n.content.length > 240 ? '...' : ''}"`;
  }).join('\n');

  const quizJson = quizAnswers ? JSON.stringify(quizAnswers).slice(0, 1800) : 'NU A COMPLETAT QUIZUL';

  return `Ești asistentul unui supervizor educațional dintr-un program pentru antreprenori. Analizezi un elev pe baza datelor lui reale și produci un BRIEFING CONCIS, în română, pentru supervizor.

DATE ELEV:
- Nume: ${profile.full_name || profile.email}
- Email: ${profile.email}
- Plan: ${profile.tariff}
- Înscris: ${profile.created_at}

SCORURI CALCULATE:
- Implicare: ${scores.engagement}/100
- Înțelegere (calitatea răspunsurilor): ${scores.understanding}/100
- Consistență (zile active 30d): ${scores.consistency}/100
- Scor global: ${scores.overall}/100
- Lecții: ${scores.lessonsCompleted}/${scores.lessonsTotal}
- Exerciții cu răspuns: ${scores.exercisesAttempted}/${scores.exercisesTotal} (calitate medie ${scores.exercisesQuality}/100)
- Notițe scrise: ${scores.notesCount}
- Ultima activitate: ${scores.daysSinceLastActive === null ? 'niciodată' : `acum ${scores.daysSinceLastActive} zile`}
- Status: ${scores.status}
${stuck ? `- Posibil blocat la: ${stuck.label}` : ''}

PROGRES PER MODUL:
${moduleBreakdown}

RĂSPUNSURI QUIZ ONBOARDING (JSON):
${quizJson}

SAMPLE RĂSPUNSURI EXERCIȚII (până la 12):
${exerciseSamples || '(niciun exercițiu completat)'}

NOTIȚE LECȚII (până la 6):
${notesSample || '(nicio notiță)'}

CONTEXT IMPORTANT:
Supervizorul (Valeria, Manager de Implementare) organizează sesiuni individuale de tracking de ~60 minute cu fiecare elev. Scopul apelului: analizează progresul, identifică blocaje, vede cum poate îmbunătăți procesul de învățare și implementare. Briefingul tău trebuie să o pregătească pentru acest apel concret.

INSTRUCȚIUNI DE FORMATARE:
Scrie EXACT 6 secțiuni, cu titluri markdown, în această ordine:

## 1. Cine e elevul
2-3 fraze: domeniu, vechime, dimensiune echipă, cifră de afaceri (din quiz). Ton neutru, factual.

## 2. Nivelul de maturitate
O frază clară: în ce stadiu este (startup / conducere manuală / iluzia sistemului / sistemic) și de ce, pe baza datelor quiz + exerciții.

## 3. Ce a făcut concret
Analizează implicarea reală. Comentează calitatea răspunsurilor (superficiale / detaliate / inconsistente). Identifică pattern-uri (ex: răspunde scurt la exerciții reflexive, completează cu efort tabelele).

## 4. Unde e blocat
Identifică problema PRINCIPALĂ acum: modul/exercițiu/concept. Dacă e inactiv, spune asta direct cu durata. Dacă răspunde dar greșit/superficial, spune ce nu pare să înțeleagă.

## 5. Recomandări pentru supervizor
EXACT 3 acțiuni concrete și scurte, fiecare începând cu un verb la imperativ (ex: "Sună-l despre...", "Verifică exercițiul...", "Trimite-i materialul...", "Felicită-l pentru..."). Acțiuni reale, nu generice.

## 6. Întrebări pentru apelul de tracking
EXACT 6-8 întrebări pe care Valeria să le pună în apelul de 60 min, PERSONALIZATE pe baza datelor concrete ale acestui elev (nu generice). Fiecare întrebare:
- Pleacă de la ceva ce elevul A SCRIS sau A FĂCUT (citează scurt în paranteză când e relevant: ex. "(la auditul de activitate ai marcat 70% rol Specialist)").
- Sau de la ceva ce LIPSEȘTE (ex: "Nu ai completat exercițiul X — ce te-a oprit?").
- Acoperă: blocaje reale, înțelegerea conceptelor cheie, aplicarea în business, motivație/timp, pași următori.
- Format: listă numerotată "1." ... "8.", fiecare întrebare pe o linie, deschisă (nu da/nu), maxim 25 cuvinte.

Lungime totală: 350-550 cuvinte. Fără introducere și fără concluzie generală. Începe direct cu "## 1. Cine e elevul". Nu inventa date care nu sunt în input — dacă lipsesc date pentru o secțiune, spune asta scurt.`;
}

export const generateStudentInsight = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    studentId: z.string().uuid(),
    force: z.boolean().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await ensureAdmin(context);

    // Cache check (24h)
    if (!data.force) {
      const { data: cached } = await admin
        .from('student_insights')
        .select('summary,scores,model_used,generated_at,updated_at')
        .eq('user_id', data.studentId)
        .maybeSingle();
      if (cached && cached.summary && cached.generated_at) {
        const ageH = (Date.now() - new Date(cached.generated_at).getTime()) / 3600000;
        if (ageH < 24) return { ...cached, fromCache: true };
      }
    }

    const gathered = await gatherStudent(admin, data.studentId);
    const prompt = buildPrompt({
      profile: gathered.profile,
      mods: gathered.mods,
      quizAnswers: gathered.quizAnswers,
      notes: gathered.notes,
      exerciseRows: gathered.exerciseRows,
      progress: gathered.progress,
      scores: gathered.scores,
      stuck: gathered.stuck,
    });

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error('LOVABLE_API_KEY lipsește din mediul serverului.');

    const model = 'google/gemini-2.5-flash';
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
        'X-Lovable-AIG-SDK': 'fetch',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Ești un analist educațional precis, factual, scris în română corectă.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      if (response.status === 429) throw new Error('Prea multe cereri AI. Reîncearcă peste un minut.');
      if (response.status === 402) throw new Error('Creditele AI sunt epuizate. Adaugă credite în setări.');
      throw new Error(`Eroare AI (${response.status}): ${text.slice(0, 200)}`);
    }

    const json = await response.json();
    const summary: string = json?.choices?.[0]?.message?.content?.trim() || '';
    if (!summary) throw new Error('Răspunsul AI a fost gol.');

    const upsertPayload = {
      user_id: data.studentId,
      summary,
      scores: gathered.scores,
      model_used: model,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error: upErr } = await admin
      .from('student_insights')
      .upsert(upsertPayload, { onConflict: 'user_id' });
    if (upErr) throw new Error(upErr.message);

    return { ...upsertPayload, fromCache: false };
  });

// ── Supervisor notes CRUD ────────────────────────────────────────────────────
export const listSupervisorNotes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ studentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await ensureAdmin(context);
    const { data: rows, error } = await admin
      .from('supervisor_notes')
      .select('id,user_id,author_id,author_name,note,created_at,updated_at')
      .eq('user_id', data.studentId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return rows || [];
  });

export const addSupervisorNote = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    studentId: z.string().uuid(),
    note: z.string().trim().min(1).max(4000),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await ensureAdmin(context);
    const { data: prof } = await admin.from('profiles').select('full_name,email').eq('id', context.userId).maybeSingle();
    const authorName = prof?.full_name || prof?.email || 'Supervizor';
    const { data: inserted, error } = await admin
      .from('supervisor_notes')
      .insert({ user_id: data.studentId, author_id: context.userId, author_name: authorName, note: data.note })
      .select('id,user_id,author_id,author_name,note,created_at,updated_at')
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

export const deleteSupervisorNote = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ noteId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await ensureAdmin(context);
    const { error } = await admin
      .from('supervisor_notes')
      .delete()
      .eq('id', data.noteId)
      .eq('author_id', context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Attention queue ──────────────────────────────────────────────────────────
export const getAttentionQueue = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(() => ({}))
  .handler(async ({ context }) => {
    const admin = await ensureAdmin(context);

    const [profilesRes, rolesRes, progressRes, exRes, notesRes, activityRes, quizRes, modulesRes, lessonsRes, exercisesRes] =
      await Promise.all([
        admin.from('profiles').select('id,email,full_name,tariff,created_at'),
        admin.from('user_roles').select('user_id,role'),
        admin.from('progress').select('user_id,lesson_id,completed_at').limit(10000),
        admin.from('exercise_responses').select('user_id,exercise_id,response').limit(10000),
        admin.from('lesson_notes').select('user_id,content').limit(10000),
        admin.from('activity_log').select('user_id,created_at').order('created_at', { ascending: false }).limit(5000),
        admin.from('quiz_responses').select('user_id'),
        admin.from('modules').select('id,title,etapa,order_index').order('order_index'),
        admin.from('lessons').select('id,module_id,order_index').order('order_index'),
        admin.from('exercises').select('id,module_id').order('order_index'),
      ]);

    const adminIds = new Set((rolesRes.data || []).filter((r: any) => r.role === 'admin').map((r: any) => r.user_id));
    const profiles = (profilesRes.data || []).filter((p: any) => !adminIds.has(p.id));

    const modules = (modulesRes.data || []) as any[];
    const lessons = (lessonsRes.data || []) as any[];
    const exercises = (exercisesRes.data || []) as any[];
    const lessonsByMod: Record<string, any[]> = {};
    const exercisesByMod: Record<string, any[]> = {};
    lessons.forEach((l: any) => { (lessonsByMod[l.module_id] ||= []).push(l); });
    exercises.forEach((e: any) => { (exercisesByMod[e.module_id] ||= []).push(e); });
    const mods = modules.map((m: any) => ({
      ...m,
      lessons: lessonsByMod[m.id] || [],
      exercises: exercisesByMod[m.id] || [],
    }));
    const totalLessons = lessons.length;
    const totalExercises = exercises.length;

    const progressByUser: Record<string, string[]> = {};
    (progressRes.data || []).forEach((p: any) => { (progressByUser[p.user_id] ||= []).push(p.lesson_id); });

    const exByUser: Record<string, Record<string, unknown>> = {};
    (exRes.data || []).forEach((r: any) => {
      (exByUser[r.user_id] ||= {})[r.exercise_id] = r.response;
    });

    const notesByUser: Record<string, number> = {};
    (notesRes.data || []).forEach((n: any) => {
      if ((n.content || '').trim().length > 5) notesByUser[n.user_id] = (notesByUser[n.user_id] || 0) + 1;
    });

    const actByUser: Record<string, string[]> = {};
    (activityRes.data || []).forEach((a: any) => { (actByUser[a.user_id] ||= []).push(a.created_at); });

    const quizUsers = new Set((quizRes.data || []).map((q: any) => q.user_id));

    const rows = profiles.map((p: any) => {
      const scores = computeScores({
        totalLessons,
        totalExercises,
        completedLessonIds: progressByUser[p.id] || [],
        exerciseResponses: exByUser[p.id] || {},
        notesCount: notesByUser[p.id] || 0,
        activityTimestamps: actByUser[p.id] || [],
        quizDone: quizUsers.has(p.id),
      });
      const stuck = detectStuckModule(mods as any, progressByUser[p.id] || [], exByUser[p.id] || {});

      // Attention score: higher = needs more attention.
      // Heavy weight on inactivity + low engagement + being stuck.
      let attention = 0;
      if (scores.daysSinceLastActive === null) attention += 30; // never active
      else attention += Math.min(40, scores.daysSinceLastActive * 2);
      attention += Math.max(0, 60 - scores.engagement) * 0.6;
      if (stuck) attention += 15;
      if (!scores.lessonsTotal) attention = 0;
      // Cap attention if mostly done
      if (scores.status === 'done') attention = 0;

      // Reason label
      let reason = 'Are nevoie de atenție';
      if (scores.daysSinceLastActive !== null && scores.daysSinceLastActive >= 14) {
        reason = `Inactiv de ${scores.daysSinceLastActive} zile`;
      } else if (scores.daysSinceLastActive !== null && scores.daysSinceLastActive >= 7) {
        reason = `Inactiv ${scores.daysSinceLastActive} zile, posibil blocat`;
      } else if (!quizUsers.has(p.id)) {
        reason = 'Nu a început quizul';
      } else if (stuck) {
        reason = `Blocat la ${stuck.label}`;
      } else if (scores.engagement < 25) {
        reason = 'Implicare foarte scăzută';
      } else if (scores.understanding < 35 && scores.exercisesAttempted > 0) {
        reason = 'Răspunsuri superficiale la exerciții';
      }

      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name || '',
        tariff: p.tariff,
        scores,
        stuckLabel: stuck?.label || null,
        attention: Math.round(attention),
        reason,
      };
    });

    rows.sort((a, b) => b.attention - a.attention);
    return rows.slice(0, 8);
  });
