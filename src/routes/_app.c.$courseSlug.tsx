// @ts-nocheck
// Poarta de curs: validează slug-ul și înscrierea, apoi pune cursul în context.
// Tot ce e sub /c/<slug>/ trece pe aici, deci e singurul loc unde se verifică
// „elevul chiar are acces la produsul ăsta".
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { getCourseBySlug } from "@/lib/courses";
import { hasCourseAccess } from "@/lib/access";
import { CourseProvider } from "@/context/CourseContext";

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

  return (
    <CourseProvider courseId={course.id}>
      <Outlet />
    </CourseProvider>
  );
}

export const Route = createFileRoute("/_app/c/$courseSlug")({ component: CourseGate });
