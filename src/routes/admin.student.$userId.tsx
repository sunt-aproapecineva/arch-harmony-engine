import { createFileRoute } from "@tanstack/react-router";
import { AdminStudentProfile } from "@/pages/admin/AdminStudentProfile";
export const Route = createFileRoute("/admin/student/$userId")({ component: AdminStudentProfile });
