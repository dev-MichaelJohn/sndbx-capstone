import React from "react";
import { UserMinus } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

interface StudentRosterCardProps {
  student: StudentClassWithDetails;
  isRegular?: boolean;
  isDropping?: boolean;
  isCurrentActiveSemester?: boolean;
  onDrop: (student: StudentClassWithDetails) => void;
}

export const StudentRosterCard: React.FC<StudentRosterCardProps> = ({
  student,
  isRegular = true,
  isDropping = false,
  isCurrentActiveSemester = true,
  onDrop,
}) => {
  const initials = student.student_name
    ? student.student_name
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 border border-border/60 shrink-0">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">{student.student_name}</h4>
              <p className="font-mono text-[10px] font-semibold text-muted-foreground mt-0.5">
                {student.institutional_id || "N/A"}
              </p>
            </div>
          </div>

          {/* Enrollment Type Badge */}
          {isRegular ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 shrink-0"
            >
              Regular
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 shrink-0"
            >
              Cross-Enrolled
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 p-2.5 px-4 bg-muted/10 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium truncate">
          {student.program_name} Year {student.class_year_level}-{student.class_section}
        </span>

        {isCurrentActiveSemester && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isDropping}
            onClick={() => onDrop(student)}
            className="h-7 px-2.5 text-xs font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive rounded-lg cursor-pointer shrink-0"
          >
            <UserMinus className="mr-1.5 size-3.5" />
            Drop
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
