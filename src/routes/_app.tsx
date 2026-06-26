// @ts-nocheck
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { useLiveContent } from "@/context/LiveContentContext";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, loading } = useAuth();
  const { ready: contentReady } = useLiveContent();
  if (loading || (user && !contentReady)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--fg-3)', fontSize: 13 }}>
        Se încarcă platforma…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}
