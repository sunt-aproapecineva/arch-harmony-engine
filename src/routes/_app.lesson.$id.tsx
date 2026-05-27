import { createFileRoute, useRouter, useParams } from "@tanstack/react-router";
import { LessonPage } from "@/pages/LessonPage";

function LessonErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error('[LessonPage] error:', error);
  const router = useRouter();
  const { id } = useParams({ strict: false }) as { id?: string };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, padding: 24, textAlign: 'center', gap: 14 }}>
      <h2 style={{ fontSize: 18, color: 'var(--fg)' }}>Nu am putut deschide lecția</h2>
      <p style={{ fontSize: 13, color: 'var(--fg-3)', maxWidth: 420 }}>
        A apărut o eroare la încărcarea lecției{id ? ` "${id}"` : ''}. Reîmprospătează pagina sau întoarce-te la dashboard.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => { router.invalidate(); reset(); }} style={{ padding: '9px 18px', borderRadius: 8, background: 'var(--accent)', color: '#0D0907', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Reîncearcă
        </button>
        <a href="/dashboard" style={{ padding: '9px 18px', borderRadius: 8, background: 'transparent', color: 'var(--fg-2)', border: '1px solid var(--border)', fontSize: 13, textDecoration: 'none' }}>
          Dashboard
        </a>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_app/lesson/$id")({
  component: LessonPage,
  errorComponent: LessonErrorComponent,
});
