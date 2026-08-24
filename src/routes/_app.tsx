// @ts-nocheck
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { useLiveContent } from "@/context/LiveContentContext";
import { CourseProvider } from "@/context/CourseContext";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, loading } = useAuth();
  const { ready: contentReady } = useLiveContent();
  // Slug-ul vine din ruta-copil /c/$courseSlug. Îl citim aici pentru că
  // PROVIDERUL TREBUIE SĂ FIE DEASUPRA LUI `Layout`: bara laterală, header-ul,
  // butonul de Telegram și comutatorul de program sunt randate de Layout, deci dacă
  // providerul stă în ruta-copil ele rămân în afara contextului — lista de module
  // apare goală, linkurile duc în /cursuri și tariful cade pe „student".
  const { courseSlug } = useParams({ strict: false }) as { courseSlug?: string };

  if (loading || (user && !contentReady)) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--fg-3)', fontSize: 13 }}>
        Se încarcă platforma…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <CourseProvider courseSlug={courseSlug}>
      <Layout />
    </CourseProvider>
  );
}
