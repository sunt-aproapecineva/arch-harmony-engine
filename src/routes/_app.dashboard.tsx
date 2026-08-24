// @ts-nocheck
// Compatibilitate: /dashboard exista înainte de multicurs. Ducem elevul în cursul lui
// (sau la selecție, dacă are mai multe).
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { resolveLandingPath } from "@/lib/navigation";

function LegacyDashboard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={resolveLandingPath(user)} replace />;
}

export const Route = createFileRoute("/_app/dashboard")({ component: LegacyDashboard });
