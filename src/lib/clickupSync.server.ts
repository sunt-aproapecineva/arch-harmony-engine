import { getCourse } from './courses';
import { getCourseModules } from './content';
import { buildBriefingComment, buildModuleMarkdown, clickUpModuleStatus, moduleIdForExercise } from './clickupFormatting';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/clickup';
const PUBLIC_SITE = 'https://aa.morarvictor.com';

const LIST_BY_FLOW: Record<string, string> = {
  'start-f1': '901524977985',
  'start-f2': '1200960000011204',
  'business-f3': '1200960000011209',
};

type Credentials = { lovableApiKey: string; connectionKey: string };
type SyncInput = { studentId: string; courseId: string; exerciseId?: string; briefingOnly?: boolean };

class ClickUpError extends Error {
  status: number;
  constructor(status: number, body: string) {
    super(`ClickUp ${status}: ${body.slice(0, 500)}`);
    this.status = status;
  }
}

async function clickUp<T>(path: string, credentials: Credentials, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${GATEWAY_URL}/${path.replace(/^\//, '')}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${credentials.lovableApiKey}`,
      'X-Connection-Api-Key': credentials.connectionKey,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) throw new ClickUpError(response.status, await response.text());
  return (response.status === 204 ? undefined : await response.json()) as T;
}

async function saveMapping(admin: any, payload: Record<string, unknown>) {
  const { error } = await admin.from('clickup_student_sync').upsert(payload, { onConflict: 'user_id,course_id' });
  if (error) throw new Error(`Nu pot salva legătura ClickUp: ${error.message}`);
}

const LOCK_LEASE_MS = 120_000;
const LOCK_WAIT_MS = 30_000;
const LOCK_RETRY_MS = 250;

function lockExpiry() {
  return new Date(Date.now() + LOCK_LEASE_MS).toISOString();
}

/**
 * Un răspuns poate fi salvat simultan din mai multe taburi sau dispozitive.
 * Lockul persistent împiedică două invocări să creeze același task ClickUp.
 */
async function acquireSyncLock(admin: any, studentId: string, courseId: string) {
  const token = crypto.randomUUID();
  const deadline = Date.now() + LOCK_WAIT_MS;
  let inserted = false;

  while (true) {
    if (!inserted) {
      inserted = true;
      const { data, error } = await admin.from('clickup_sync_locks').upsert({
        user_id: studentId,
        course_id: courseId,
        lock_token: token,
        expires_at: lockExpiry(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id', ignoreDuplicates: true }).select('lock_token').maybeSingle();
      if (error) throw new Error(`Nu pot bloca sincronizarea ClickUp: ${error.message}`);
      if (data?.lock_token === token) return token;
    } else {
      const { data, error } = await admin.from('clickup_sync_locks').update({
        lock_token: token,
        expires_at: lockExpiry(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', studentId).eq('course_id', courseId)
        .lte('expires_at', new Date().toISOString()).select('lock_token').maybeSingle();
      if (error) throw new Error(`Nu pot prelua lockul ClickUp: ${error.message}`);
      if (data?.lock_token === token) return token;
    }

    if (Date.now() >= deadline) {
      throw new Error('O altă sincronizare ClickUp este încă în curs. Răspunsul este salvat; reîncearcă sincronizarea în scurt timp.');
    }
    await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_MS));
  }
}

async function renewSyncLock(admin: any, studentId: string, courseId: string, token: string) {
  const { data, error } = await admin.from('clickup_sync_locks').update({
    expires_at: lockExpiry(),
    updated_at: new Date().toISOString(),
  }).eq('user_id', studentId).eq('course_id', courseId).eq('lock_token', token)
    .select('lock_token').maybeSingle();
  if (error) throw new Error(`Nu pot prelungi lockul ClickUp: ${error.message}`);
  if (!data) throw new Error('Lockul ClickUp a expirat. Sincronizarea a fost oprită pentru a preveni duplicatele.');
}

async function releaseSyncLock(admin: any, studentId: string, courseId: string, token: string) {
  const { error } = await admin.from('clickup_sync_locks').update({
    expires_at: new Date(0).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('user_id', studentId).eq('course_id', courseId).eq('lock_token', token);
  if (error) throw new Error(`Nu pot elibera lockul ClickUp: ${error.message}`);
}

async function syncStudentWithClickUpLocked(admin: any, input: SyncInput, credentials: Credentials, lockToken: string) {
  const { studentId, courseId, exerciseId } = input;
  const course = getCourse(courseId);
  if (!course) throw new Error('Program necunoscut.');
  const modules = getCourseModules(courseId);
  if (!modules.length) throw new Error('Programul nu are module configurate.');

  const [profileRes, enrollmentRes, responsesRes, insightRes, mappingRes] = await Promise.all([
    admin.from('profiles').select('id,email,full_name,tariff,created_at').eq('id', studentId).maybeSingle(),
    admin.from('enrollments').select('course_id,flow_id,tariff,granted_at').eq('user_id', studentId).eq('course_id', courseId).maybeSingle(),
    admin.from('exercise_responses').select('exercise_id,response,updated_at').eq('user_id', studentId),
    admin.from('student_insights').select('summary,generated_at').eq('user_id', studentId).eq('course_id', courseId).maybeSingle(),
    admin.from('clickup_student_sync').select('*').eq('user_id', studentId).eq('course_id', courseId).maybeSingle(),
  ]);
  if (profileRes.error) throw new Error(profileRes.error.message);
  if (enrollmentRes.error) throw new Error(enrollmentRes.error.message);
  if (responsesRes.error) throw new Error(responsesRes.error.message);
  const profile = profileRes.data;
  const enrollment = enrollmentRes.data;
  if (!profile) throw new Error('Elev inexistent.');
  if (!enrollment) throw new Error('Elevul nu este înscris la acest program.');
  const flowId = enrollment.flow_id;
  const listId = flowId ? LIST_BY_FLOW[flowId] : undefined;
  if (!flowId || !listId) {
    throw new Error(`Fluxul ${flowId || 'neasignat'} nu are o listă ClickUp configurată. Listele disponibile sunt START Flux 1, START Flux 2 și Business Flux 3.`);
  }

  const responses: Record<string, unknown> = {};
  for (const row of responsesRes.data || []) responses[row.exercise_id] = row.response;
  const existing = mappingRes.data;
  let taskId: string | undefined = existing?.task_id;
  let taskUrl: string | null = existing?.task_url ?? null;
  let subtasks: Record<string, string> = { ...(existing?.subtasks || {}) };
  let briefingCommentId: string | null = existing?.briefing_comment_id ?? null;
  const studentName = profile.full_name || profile.email;
  const parentDescription = [
    `## ${studentName}`,
    '',
    `- **Email:** ${profile.email}`,
    `- **Program:** ${course.title}`,
    `- **Treaptă:** ${enrollment.tariff}`,
    `- **Flux:** ${flowId}`,
    `- **Profil Admin:** ${PUBLIC_SITE}/admin/student/${studentId}`,
    '',
    'Modulele și răspunsurile sunt actualizate automat din platformă. Briefingul AI este în comentariul dedicat de mai jos.',
  ].join('\n');

  await renewSyncLock(admin, studentId, courseId, lockToken);

  try {
    if (taskId) {
      try {
        await clickUp(`api/v2/task/${taskId}`, credentials, {
          method: 'PUT',
          body: JSON.stringify({ name: studentName, markdown_description: parentDescription }),
        });
      } catch (error) {
        if (!(error instanceof ClickUpError) || error.status !== 404) throw error;
        taskId = undefined;
        taskUrl = null;
        subtasks = {};
        briefingCommentId = null;
      }
    }

    if (!taskId) {
      const created = await clickUp<{ id: string; url: string }>(`api/v2/list/${listId}/task`, credentials, {
        method: 'POST',
        body: JSON.stringify({ name: studentName, markdown_description: parentDescription, status: 'in progres', notify_all: false }),
      });
      taskId = created.id;
      taskUrl = created.url;
      subtasks = {};
      briefingCommentId = null;
    }

    // Salvăm imediat taskul părinte: o eroare la un subtask nu poate produce duplicate la reîncercare.
    await saveMapping(admin, {
      user_id: studentId,
      course_id: courseId,
      task_id: taskId,
      task_url: taskUrl,
      subtasks,
      briefing_comment_id: briefingCommentId,
      last_error: null,
      updated_at: new Date().toISOString(),
    });

    const missing = modules.filter(mod => !subtasks[mod.id]);
    const targetModuleId = exerciseId ? moduleIdForExercise(courseId, exerciseId) : undefined;
    const targets = missing.length
      ? modules
      : input.briefingOnly
        ? []
        : targetModuleId
          ? modules.filter(mod => mod.id === targetModuleId)
          : modules;

    for (const mod of targets) {
      await renewSyncLock(admin, studentId, courseId, lockToken);
      const body = {
        name: `${mod.etapa} · ${mod.title}`,
        markdown_description: buildModuleMarkdown(mod, responses),
        status: clickUpModuleStatus(mod, responses),
        notify_all: false,
      };
      let subtaskId: string | undefined = subtasks[mod.id];
      if (subtaskId) {
        try {
          await clickUp(`api/v2/task/${subtaskId}`, credentials, { method: 'PUT', body: JSON.stringify(body) });
        } catch (error) {
          if (!(error instanceof ClickUpError) || error.status !== 404) throw error;
          subtaskId = undefined;
        }
      }
      if (!subtaskId) {
        const created = await clickUp<{ id: string }>(`api/v2/list/${listId}/task`, credentials, {
          method: 'POST',
          body: JSON.stringify({ ...body, parent: taskId }),
        });
        subtaskId = created.id;
        subtasks[mod.id] = subtaskId;
        await saveMapping(admin, {
          user_id: studentId,
          course_id: courseId,
          task_id: taskId,
          task_url: taskUrl,
          subtasks,
          briefing_comment_id: briefingCommentId,
          updated_at: new Date().toISOString(),
        });
      }
    }

    await renewSyncLock(admin, studentId, courseId, lockToken);
    const summary = insightRes.data?.summary?.trim();
    if (summary && taskId) {
      const commentText = buildBriefingComment(summary, insightRes.data.generated_at);
      if (briefingCommentId) {
        try {
          await clickUp(`api/v2/comment/${briefingCommentId}`, credentials, {
            method: 'PUT',
            body: JSON.stringify({ comment_text: commentText }),
          });
        } catch (error) {
          if (!(error instanceof ClickUpError) || error.status !== 404) throw error;
          briefingCommentId = null;
        }
      }
      if (!briefingCommentId) {
        const comment = await clickUp<{ id: string | number }>(`api/v2/task/${taskId}/comment`, credentials, {
          method: 'POST',
          body: JSON.stringify({ comment_text: commentText, notify_all: false }),
        });
        briefingCommentId = String(comment.id);
      }
    }

    await saveMapping(admin, {
      user_id: studentId,
      course_id: courseId,
      task_id: taskId,
      task_url: taskUrl,
      subtasks,
      briefing_comment_id: briefingCommentId,
      last_synced_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    });
    return {
      ok: true,
      taskId,
      taskUrl,
      modulesSynced: targets.length,
      modulesTotal: modules.length,
      briefingSynced: Boolean(summary),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (taskId) {
      await saveMapping(admin, {
        user_id: studentId,
        course_id: courseId,
        task_id: taskId,
        task_url: taskUrl,
        subtasks,
        briefing_comment_id: briefingCommentId,
        last_error: message,
        updated_at: new Date().toISOString(),
      }).catch(() => undefined);
    }
    throw error;
  }
}

/** Server-only: apelată după verificarea identității și a rolului în createServerFn. */
export async function syncStudentWithClickUp(admin: any, input: SyncInput, credentials: Credentials) {
  const lockToken = await acquireSyncLock(admin, input.studentId, input.courseId);
  try {
    return await syncStudentWithClickUpLocked(admin, input, credentials, lockToken);
  } finally {
    await releaseSyncLock(admin, input.studentId, input.courseId, lockToken)
      .catch((error: unknown) => console.error('[clickupSync] Could not release sync lock', error));
  }
}
