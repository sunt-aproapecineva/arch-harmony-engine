import { createFileRoute } from "@tanstack/react-router";
import { DocumentWizardPage } from "@/pages/DocumentWizardPage";

export const Route = createFileRoute("/_app/c/$courseSlug/documents/$docId/fill")({ component: DocumentWizardPage });
