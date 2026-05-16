import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (adminOnly && user.role !== "admin") navigate({ to: "/dashboard", replace: true });
  }, [user, loading, adminOnly, navigate]);

  if (loading || !user || (adminOnly && user.role !== "admin")) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <div className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }
  return <>{children}</>;
}
