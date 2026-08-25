// Turul de bun venit. E o pagină a unui cont, nu una publică: fără poartă, un vizitator
// nelogat vedea turul și abia la final era trimis la /login — o promisiune urmată de un
// refuz. Poarta o transformă într-o redirecționare imediată și cinstită.
import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingWizard } from "@/pages/OnboardingWizard";

function Welcome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <OnboardingWizard />;
}

export const Route = createFileRoute("/welcome")({ component: Welcome });
