import React from "react";
import {
  BookOpen,
  User,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFullName } from "@/lib/nameFormatter";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

interface CourseOfferingCardProps {
  offering: CourseOfferingWithDetails;
  onEdit: (offering: CourseOfferingWithDetails) => void;
  onDelete: (offering: CourseOfferingWithDetails) => void;
  onViewStudents: (offering: CourseOfferingWithDetails) => void;
  isCurrentActiveSemester?: boolean;
}

export const CourseOfferingCard: React.FC<CourseOfferingCardProps> = ({
  offering,
  onEdit,
  onDelete,
  onViewStudents,
  isCurrentActiveSemester = true,
}) => {
  const hasFaculty = offering.first_name && offering.last_name;
  const facultyName = hasFaculty
    ? formatFullName({
        first_name: offering.first_name!,
        middle_name: offering.middle_name ?? "",
        last_name: offering.last_name!,
        suffix: offering.suffix ?? "",
      })
    : null;

  const initials = hasFaculty
    ? `${offering.first_name![0]}${offering.last_name![0]}`.toUpperCase()
    : "U";

  return (
    <Card className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-2xs group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="size-5.5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <Badge
              variant="outline"
              className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 bg-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/20"
            >
              {offering.course_initialism}
            </Badge>
            <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
              {offering.course_name}
            </h3>
          </div>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7.5 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.96] cursor-pointer"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 rounded-xl p-1 shadow-lg border-border/80"
          >
            <DropdownMenuItem
              className="cursor-pointer text-xs gap-2 py-1.5"
              onClick={() => onViewStudents(offering)}
            >
              <Users className="size-3.5 text-muted-foreground" />
              <span>View Students</span>
            </DropdownMenuItem>

            {isCurrentActiveSemester && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer text-xs gap-2 py-1.5"
                  onClick={() => onEdit(offering)}
                >
                  <Edit className="size-3.5 text-muted-foreground" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-xs gap-2 py-1.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                  onClick={() => onDelete(offering)}
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Offering</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle: Assigned Instructor */}
      <div className="my-4 rounded-xl border border-border/50 bg-muted/20 p-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          <span>Assigned Instructor</span>
          {hasFaculty && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
              <ShieldCheck className="size-3" /> assigned
            </span>
          )}
        </div>

        {hasFaculty ? (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7.5 rounded-lg border border-border/60 shrink-0">
              <AvatarFallback className="bg-sky-500/10 text-xs font-bold text-sky-600 dark:text-sky-400">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{facultyName}</p>
              <p className="font-mono text-[10px] text-muted-foreground truncate">
                ID: {offering.institutional_id || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground italic py-0.5">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" /> Instructor unassigned
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
            >
              Needs Instructor
            </Badge>
          </div>
        )}
      </div>

      {/* Footer: Academic Term + Class Roster CTA */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] font-mono text-muted-foreground">
          Year {offering.year_level} • {offering.semester_term} Term
        </span>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewStudents(offering)}
          className="h-7 text-xs font-bold gap-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-lg cursor-pointer active:scale-[0.96]"
        >
          <Users className="size-3.5" />
          <span>Class Roster</span>
          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};
