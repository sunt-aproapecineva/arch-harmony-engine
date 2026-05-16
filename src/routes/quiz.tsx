import { createFileRoute } from "@tanstack/react-router";
import { OnboardingQuiz } from "@/pages/OnboardingQuiz";

export const Route = createFileRoute("/quiz")({ component: OnboardingQuiz });
