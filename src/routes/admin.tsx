// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/pages/admin/AdminLayout";

export const Route = createFileRoute("/admin")({ component: AdminGate });

function AdminGate() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <AdminLayout />;
}
