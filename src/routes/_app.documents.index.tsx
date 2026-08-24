// @ts-nocheck
// Compatibilitate cu ruta de dinainte de multicurs.
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { enrolledCourses } from "@/lib/enrollments";
import { coursePath } from "@/lib/navigation";

function Legacy() {
  const { user, loading } = useAuth();
  if (loading) return null;
  const courses = enrolledCourses(user?.enrollments);
  if (courses.length !== 1) return <Navigate to="/cursuri" replace />;
  return <Navigate to={coursePath(courses[0], 'documents')} replace />;
}

export const Route = createFileRoute("/_app/documents/")({ component: Legacy });
