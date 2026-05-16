import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "@/lib/router-compat";
import Login from "@/pages/Login";

export const Route = createFileRoute("/login")({ component: LoginRoute });

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}
