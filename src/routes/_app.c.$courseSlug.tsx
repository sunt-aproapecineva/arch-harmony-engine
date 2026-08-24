// @ts-nocheck
// Poarta de curs: validează slug-ul și înscrierea.
//
// Contextul de curs NU se montează aici, ci în `_app.tsx`, deasupra lui `Layout` —
// altfel bara laterală și header-ul, care sunt randate de Layout, ar rămâne în afara
// lui. Aici rămâne doar verificarea accesului.
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { getCourseBySlug } from "@/lib/courses";
import { hasCourseAccess } from "@/lib/access";

function CourseGate() {
  const { user, loading } = useAuth();
  const { courseSlug } = useParams({ strict: false }) as { courseSlug?: string };
  const course = getCourseBySlug(courseSlug);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Slug inexistent sau curs dezactivat → înapoi la selecție, nu 404 sec.
  if (!course || !course.is_active) return <Navigate to="/cursuri" replace />;

  // Adminul poate deschide orice curs, ca să poată verifica conținutul fără să se
  // înscrie singur (înscrierile sunt oricum blocate pentru non-admini în DB).
  if (user.role !== 'admin' && !hasCourseAccess(user, course.id)) {
    return <Navigate to="/cursuri" replace />;
  }

  return <Outlet />;
}

export const Route = createFileRoute("/_app/c/$courseSlug")({ component: CourseGate });
