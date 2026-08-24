import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/pages/ModulePage";

export const Route = createFileRoute("/_app/c/$courseSlug/module/$id")({ component: ModulePage });
