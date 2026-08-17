import { useCourseOfferings } from "@/features/offerings/api/offerings.service";
import {
  useMyReports,
  useAcknowledgeReport,
} from "@/features/evaluation-report/api/evaluation-report.service";

/**
 * Fetches assigned teaching course offerings for a specific faculty member,
 * filtered by an optional semesterId.
 */
export const useFacultyOfferings = (facultyId?: number, semesterId?: number) => {
  return useCourseOfferings({
    faculty_id: facultyId,
    semester_id: semesterId,
    page: 1,
  });
};

/**
 * Hook to retrieve personal Individual Faculty Evaluation Reports (IFER).
 */
export const useFacultySelfReports = () => {
  return useMyReports();
};

/**
 * Hook to execute CHED-mandated report acknowledgment.
 */
export const useAcknowledgeFacultyReport = (reportId: number) => {
  return useAcknowledgeReport(reportId);
};
