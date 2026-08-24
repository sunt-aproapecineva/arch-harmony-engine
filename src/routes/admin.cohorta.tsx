import { createFileRoute } from "@tanstack/react-router";
import { AdminCohort } from "@/pages/admin/AdminCohort";

export const Route = createFileRoute("/admin/cohorta")({ component: AdminCohort });
