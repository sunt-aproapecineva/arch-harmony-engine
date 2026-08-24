import { createFileRoute } from "@tanstack/react-router";
import { AdminFlowPanel } from "@/pages/admin/AdminFlowPanel";

export const Route = createFileRoute("/admin/cohorta")({ component: AdminFlowPanel });
