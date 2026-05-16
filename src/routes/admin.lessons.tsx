import { createFileRoute } from "@tanstack/react-router";
import { AdminLessons } from "@/pages/admin/AdminLessons";
export const Route = createFileRoute("/admin/lessons")({ component: AdminLessons });
