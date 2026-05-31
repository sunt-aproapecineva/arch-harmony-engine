import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/pages/LibraryPage";

export const Route = createFileRoute("/_app/library/")({ component: LibraryPage });
