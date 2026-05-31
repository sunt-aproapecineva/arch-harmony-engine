import { createFileRoute } from "@tanstack/react-router";
import { LibraryArticlePage } from "@/pages/LibraryArticlePage";

export const Route = createFileRoute("/_app/library/$slug")({ component: LibraryArticlePage });
