// @ts-nocheck
// Compatibilitate: /lesson/<id>. Cursul se deduce din prefixul id-ului de lecție
// (vezi REGULA ID-URILOR din src/lib/courses.ts).
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { legacyContentPath } from "@/lib/navigation";

function LegacyLesson() {
  const { id } = useParams({ strict: false }) as { id?: string };
  return <Navigate to={legacyContentPath('lesson', id || '')} replace />;
}

export const Route = createFileRoute("/_app/lesson/$id")({ component: LegacyLesson });
