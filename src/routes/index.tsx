// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { resolveLandingPath } from "@/lib/navigation";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Arhitectura Afacerii · Programele tale' },
    { name: 'description', content: 'Accesează programele Arhitectura Afacerii Business și START.' },
    { property: 'og:title', content: 'Arhitectura Afacerii · Programele tale' },
    { property: 'og:description', content: 'Accesează programele Arhitectura Afacerii Business și START.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={resolveLandingPath(user)} replace />;
}
