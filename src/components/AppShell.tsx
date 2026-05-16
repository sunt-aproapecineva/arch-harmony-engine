import { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Moon, Sun, LogOut, LayoutDashboard, BookOpen, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const initial = (user?.full_name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "var(--header-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 24 }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #1A5C38, #0f3d22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(26,92,56,0.35)",
            }}>
              <span className="font-aboreto" style={{ fontSize: 11, color: "#C4F0E4" }}>AA</span>
            </div>
            <span className="font-aboreto" style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--fg)" }}>
              ARHITECTURA AFACERII
            </span>
          </Link>

          <nav style={{ display: "flex", gap: 4, marginLeft: 24 }}>
            <NavLink to="/dashboard" active={path === "/dashboard"} icon={<LayoutDashboard size={14} />}>Dashboard</NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" active={path.startsWith("/admin")} icon={<Shield size={14} />}>Admin</NavLink>
            )}
          </nav>

          <div style={{ flex: 1 }} />

          <button onClick={toggle} className="btn-ghost" aria-label="Toggle theme" style={{ padding: 8 }}>
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--gold))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#0D0907", fontWeight: 700, fontSize: 13,
            }}>
              {initial}
            </div>
            <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="btn-ghost" style={{ padding: 8 }} aria-label="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <motion.main
        key={path}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}
      >
        {children}
      </motion.main>
    </div>
  );
}

function NavLink({ to, active, icon, children }: { to: string; active: boolean; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 8,
        fontSize: 13, fontWeight: 500,
        color: active ? "var(--fg)" : "var(--fg-3)",
        background: active ? "var(--bg-3)" : "transparent",
        transition: "all 0.15s",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
