import { useNavigate } from "react-router";
import { Eye, FileText, GraduationCap, MoreHorizontal, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableColumn } from "@/components/main-data-table";

import { EvaluationReportStatusBadge } from "./EvaluationReportStatusBadge";
import { downloadFedafPdf, downloadIferPdf } from "../api/evaluation-report.service";
import { useSemester } from "@/features/semester/api/semester.service";
import type { IferSelect } from "backend/types/evaluation-report.type";

export type EvaluationReportRow = IferSelect & { faculty_name?: string | null };

const formatScore = (val: string | null) => {
  if (!val) return "N/A";
  const num = Number(val);
  return num > 5 ? `${num.toFixed(2)}%` : `${num.toFixed(2)} / 5.0`;
};

const SemesterCell = ({ semesterId }: { semesterId: number }) => {
  const { data: semester } = useSemester(semesterId);

  return (
    <div className="flex items-center gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
        <GraduationCap className="size-3.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground">
          {semester
            ? `AY ${semester.school_year_start}–${semester.school_year_end}`
            : `Semester #${semesterId}`}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {semester ? `${semester.semester_term} Term` : `ID: ${semesterId}`}
        </span>
      </div>
    </div>
  );
};

export const getEvaluationReportColumns = (): Array<DataTableColumn<EvaluationReportRow>> => [
  {
    header: "Report Ref",
    className: "w-28",
    cell: (row) => (
      <span className="inline-flex items-center rounded-md border border-border/50 bg-muted/40 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
        IFER #{row.id}
      </span>
    ),
  },
  {
    header: "Faculty Member",
    className: "w-48",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
          <User className="size-3.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="truncate text-xs font-semibold text-foreground">
            {row.faculty_name ?? `Faculty #${row.faculty_id}`}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            ID: {row.faculty_id}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: "Academic Term",
    className: "w-44",
    cell: (row) => <SemesterCell semesterId={row.semester_id} />,
  },
  {
    header: "SET Rating",
    className: "w-28",
    cell: (row) => (
      <span className="font-mono text-xs font-semibold text-emerald-400">
        {formatScore(row.overall_set_rating)}
      </span>
    ),
  },
  {
    header: "SEF Rating",
    className: "w-28",
    cell: (row) => (
      <span className="font-mono text-xs font-semibold text-sky-400">
        {formatScore(row.overall_sef_rating)}
      </span>
    ),
  },
  {
    header: "Status",
    className: "w-32",
    cell: (row) => <EvaluationReportStatusBadge status={row.status} />,
  },
  {
    header: "Actions",
    className: "w-px whitespace-nowrap",
    cell: (row) => {
      const navigate = useNavigate();

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-7 cursor-pointer rounded-lg p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 rounded-xl p-1">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs focus:bg-accent"
                onClick={() => navigate(`${row.id}`)}
              >
                <Eye className="mr-2 size-3.5 text-muted-foreground" />
                View Detailed Report
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs focus:bg-accent"
                onClick={() => downloadIferPdf(row.id)}
              >
                <FileText className="mr-2 size-3.5 text-emerald-400" />
                Download IFER Document
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs focus:bg-accent"
                onClick={() => downloadFedafPdf(row.id)}
              >
                <FileText className="mr-2 size-3.5 text-sky-400" />
                Download FEDAF Action Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
