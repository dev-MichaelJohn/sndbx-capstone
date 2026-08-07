import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useReportDetail, useSaveDevelopmentPlan } from "../api/evaluation-report.service";
import toast from "react-hot-toast";

interface ReportDetailModalProps {
  reportId: number | null;
  onClose: () => void;
}

export const ReportDetailModal = ({ reportId, onClose }: ReportDetailModalProps) => {
  const isOpen = Boolean(reportId);
  const { data: detail, isLoading } = useReportDetail(reportId ?? 0);
  const savePlan = useSaveDevelopmentPlan(reportId ?? 0);

  const handleSavePlan = async (payload: {
    areas_for_improvement: string;
    proposed_activities: string;
    action_plan: string;
  }) => {
    if (!reportId) return;
    try {
      await savePlan.mutateAsync(payload);
      toast.success("FEDAF development plan saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save plan.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="p-4 border-b bg-muted/20">
          <DialogTitle className="text-base font-semibold">
            Faculty Evaluation Report Detail #{reportId}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading || !detail ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading report details...
            </div>
          ) : (
            <div className="space-y-6">
              <ReportSummaryCard detail={detail} />

              {/* Class Summaries shadcn Table */}
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
                        <TableHead className="text-xs font-semibold">Students</TableHead>
                        <TableHead className="text-xs font-semibold">Avg SET</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.class_summaries.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-medium">
                            {item.course_code}
                          </TableCell>
                          <TableCell className="text-xs">{item.section}</TableCell>
                          <TableCell className="text-xs">{item.student_count}</TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-emerald-500">
                            {item.average_set_rating}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* FEDAF Development Plan Form */}
              <FedafPlanForm
                initialPlan={{
                  areas_for_improvement: detail.report.areas_for_improvement ?? "",
                  proposed_activities: detail.report.proposed_activities ?? "",
                  action_plan: detail.report.action_plan ?? "",
                }}
                isSaving={savePlan.isPending}
                onSave={handleSavePlan}
              />
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
