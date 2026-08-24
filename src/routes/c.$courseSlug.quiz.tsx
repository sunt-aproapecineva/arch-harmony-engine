// @ts-nocheck
// Quizul de onboarding al cursului. Stă în afara layout-ului /_app pentru că e o
// pagină pe tot ecranul (fără sidebar/header), la fel ca înainte de multicurs.
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { getCourseBySlug } from "@/lib/courses";
import { hasCourseAccess } from "@/lib/access";
import { CourseProvider } from "@/context/CourseContext";
import { OnboardingQuiz } from "@/pages/OnboardingQuiz";

function CourseQuiz() {
  const { user, loading } = useAuth();
  const { courseSlug } = useParams({ strict: false }) as { courseSlug?: string };
  const course = getCourseBySlug(courseSlug);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!course || !course.is_active) return <Navigate to="/cursuri" replace />;
  if (user.role !== 'admin' && !hasCourseAccess(user, course.id)) return <Navigate to="/cursuri" replace />;

  return (
    <CourseProvider courseId={course.id}>
      <OnboardingQuiz />
    </CourseProvider>
  );
}

export const Route = createFileRoute("/c/$courseSlug/quiz")({ component: CourseQuiz });
