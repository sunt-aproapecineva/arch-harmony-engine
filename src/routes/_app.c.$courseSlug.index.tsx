// @ts-nocheck
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

// /c/<slug> singur nu arată nimic — duce în dashboard-ul cursului.
function CourseIndex() {
  const { courseSlug } = useParams({ strict: false }) as { courseSlug?: string };
  return <Navigate to={`/c/${courseSlug}/dashboard`} replace />;
}

export const Route = createFileRoute("/_app/c/$courseSlug/")({ component: CourseIndex });
