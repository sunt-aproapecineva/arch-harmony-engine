// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { resolveLandingPath } from "@/lib/navigation";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={resolveLandingPath(user)} replace />;
}
