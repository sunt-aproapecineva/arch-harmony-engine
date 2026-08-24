import { createFileRoute } from "@tanstack/react-router";
import { AdminFlows } from "@/pages/admin/AdminFlows";

export const Route = createFileRoute("/admin/fluxuri")({ component: AdminFlows });
