import { createFileRoute } from "@tanstack/react-router";
import { MaterialsPage } from "@/pages/MaterialsPage";

export const Route = createFileRoute("/_app/materials/")({ component: MaterialsPage });
