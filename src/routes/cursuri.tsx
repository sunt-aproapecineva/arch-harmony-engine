// @ts-nocheck
// Ecranul general de selecție a cursului. Stă în afara layout-ului /_app pentru că
// sidebar-ul și header-ul de acolo sunt deja legate de un curs anume.
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { CoursesHub } from "@/pages/CoursesHub";

function CoursesRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <CoursesHub />;
}

export const Route = createFileRoute("/cursuri")({ component: CoursesRoute });
