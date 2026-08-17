import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportSummaryCard } from "./ReportCardSummary";
import { FedafPlanForm } from "./FedafPlanForm";
import { useReportDetail } from "../api/evaluation-report.service";

interface ReportDetailModalProps {
  reportId: number | null;
  onClose: () => void;
}

export const ReportDetailModal = ({ reportId, onClose }: ReportDetailModalProps) => {
  const isOpen = Boolean(reportId);
  const { data: detail, isLoading } = useReportDetail(reportId ?? 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[92vw] h-[88vh] max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
        <DialogHeader className="p-4 px-6 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-base font-semibold">
            Faculty Evaluation Report Detail #{reportId}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {isLoading || !detail ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading report details...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Faculty Summary & Ratings Header Card */}
              <ReportSummaryCard detail={detail} />

              {/* Class SET Summaries Table */}
              <Card className="rounded-xl border shadow-xs overflow-hidden">
                <CardHeader className="py-3 px-4 border-b bg-muted/30">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Class SET Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Course Code</TableHead>
                        <TableHead className="text-xs font-semibold">Section</TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Students
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">Avg SET</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.class_summaries.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-bold text-primary">
                            {item.course_code}
                          </TableCell>
                          <TableCell className="text-xs">{item.section}</TableCell>
                          <TableCell className="text-xs font-mono text-center">
                            {item.student_count}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-emerald-500 text-right">
                            {item.average_set_rating}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* FEDAF Development Plan Form in Read-Only Mode for Faculty */}
              <FedafPlanForm
                initialPlan={{
                  areas_for_improvement: detail.report.areas_for_improvement ?? "",
                  proposed_activities: detail.report.proposed_activities ?? "",
                  action_plan: detail.report.action_plan ?? "",
                }}
                readOnly={true}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
