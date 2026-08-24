import { createFileRoute } from "@tanstack/react-router";
import { DocumentsPage } from "@/pages/DocumentsPage";

export const Route = createFileRoute("/_app/c/$courseSlug/documents/")({ component: DocumentsPage });
