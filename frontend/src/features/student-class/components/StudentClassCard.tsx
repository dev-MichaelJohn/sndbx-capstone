import React from "react";
import { UserMinus, GraduationCap, Building2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

interface StudentClassCardProps {
  student: StudentClassWithDetails;
  isRegular?: boolean;
  onDrop: (student: StudentClassWithDetails) => void;
  isCurrentActiveSemester?: boolean;
  disabled?: boolean;
}

export const StudentClassCard: React.FC<StudentClassCardProps> = ({
  student,
  isRegular = true,
  onDrop,
  isCurrentActiveSemester = true,
  disabled = false,
}) => {
  const initials =
    student.student_name
      .split(",")
      .map((s) => s.trim()[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  return (
    <Card className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5">
      {/* Top Student Identity Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar className="size-11 rounded-xl border border-border/80 shadow-2xs shrink-0">
            <AvatarFallback className="bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
              {student.student_name}
            </h3>
            <p className="font-mono text-[11px] font-semibold text-muted-foreground mt-0.5 truncate">
              {student.institutional_id || "No ID"}
            </p>
          </div>
        </div>

        {/* Enrollment Type Pill */}
        <Badge
          variant="outline"
          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md shrink-0 shadow-2xs ${
            isRegular
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          {isRegular ? "Regular" : "Cross-Enrolled"}
        </Badge>
      </div>

      {/* Middle: Home Program & Section */}
      <div className="my-4 rounded-xl border border-border/50 bg-muted/20 p-2.5 flex items-center gap-2.5 text-xs text-muted-foreground">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 text-primary">
          <GraduationCap className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Home Section
          </p>
          <p className="text-xs font-semibold text-foreground truncate">
            {student.program_name} Year {student.class_year_level}-{student.class_section}
          </p>
        </div>
      </div>

      {/* Footer: Status & Drop Action */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
          <Building2 className="size-3 text-muted-foreground/70" />
          <span>Active Roster</span>
        </span>

        {isCurrentActiveSemester && (
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => onDrop(student)}
            className="h-7 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer active:scale-[0.96] gap-1 px-2.5"
          >
            <UserMinus className="size-3.5" />
            <span>Drop</span>
          </Button>
        )}
      </div>
    </Card>
  );
};
