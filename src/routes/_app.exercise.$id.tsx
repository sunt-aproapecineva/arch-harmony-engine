import { createFileRoute } from "@tanstack/react-router";
import { ExercisePage } from "@/pages/ExercisePage";

export const Route = createFileRoute("/_app/exercise/$id")({ component: ExercisePage });
