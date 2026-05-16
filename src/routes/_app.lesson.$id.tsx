import { createFileRoute } from "@tanstack/react-router";
import { LessonPage } from "@/pages/LessonPage";

export const Route = createFileRoute("/_app/lesson/$id")({ component: LessonPage });
