import { createFileRoute } from "@tanstack/react-router";
import { DocumentWizardPage } from "@/pages/DocumentWizardPage";

export const Route = createFileRoute("/_app/documents/$docId/fill")({ component: DocumentWizardPage });
