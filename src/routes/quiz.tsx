// @ts-nocheck
// Compatibilitate: /quiz fără curs. Îl trimitem la quizul cursului, dacă e evident care.
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { enrolledCourses } from "@/lib/enrollments";
import { courseQuizPath } from "@/lib/navigation";

function LegacyQuiz() {
  const { user, loading } = useAuth();
  if (loading) return null;
  const courses = enrolledCourses(user?.enrollments);
  if (courses.length !== 1) return <Navigate to="/cursuri" replace />;
  return <Navigate to={courseQuizPath(courses[0])} replace />;
}

export const Route = createFileRoute("/quiz")({ component: LegacyQuiz });
