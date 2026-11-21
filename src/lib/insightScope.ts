import { parseTariffFilter } from './courses';

export type InsightEnrollment = {
  user_id: string;
  course_id: string;
  flow_id: string | null;
  tariff: string;
};

export type InsightScope = {
  courseId?: string | null;
  flowId?: string | null;
  tariffId?: string | null;
  studentIds?: string[];
};

/** O înscriere = un briefing. Filtrele se aplică pe aceeași înscriere. */
export function selectInsightEnrollments(
  enrollments: InsightEnrollment[],
  adminIds: Set<string>,
  scope: InsightScope,
): InsightEnrollment[] {
  const tier = parseTariffFilter(scope.tariffId);
  const requestedStudents = scope.studentIds ? new Set(scope.studentIds) : null;
  const seen = new Set<string>();
  return enrollments.filter(enrollment => {
    const key = `${enrollment.user_id}:${enrollment.course_id}`;
    if (seen.has(key) || adminIds.has(enrollment.user_id)) return false;
    if (requestedStudents && !requestedStudents.has(enrollment.user_id)) return false;
    if (scope.courseId && enrollment.course_id !== scope.courseId) return false;
    if (scope.flowId && enrollment.flow_id !== scope.flowId) return false;
    if (tier && (enrollment.course_id !== tier.courseId || enrollment.tariff !== tier.tierId)) return false;
    seen.add(key);
    return true;
  });
}
