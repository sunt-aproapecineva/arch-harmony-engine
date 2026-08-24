// @ts-nocheck
// Compatibilitate: /module/<id> — cursul se deduce din prefixul id-ului.
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import { legacyContentPath } from "@/lib/navigation";

function LegacyModule() {
  const { id } = useParams({ strict: false }) as { id?: string };
  return <Navigate to={legacyContentPath('module', id || '')} replace />;
}

export const Route = createFileRoute("/_app/module/$id")({ component: LegacyModule });
