import { createFileRoute } from "@tanstack/react-router";
import { OnboardingWizard } from "@/pages/OnboardingWizard";

export const Route = createFileRoute("/welcome")({ component: OnboardingWizard });
