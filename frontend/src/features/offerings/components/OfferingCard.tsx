import React from "react";
import { BookOpen, Users, MoreHorizontal, Edit } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import { CourseOfferingDeleteDialog } from "./OfferingDelete";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

interface OfferingCardProps {
  offering: CourseOfferingWithDetails;
  onEdit: (offering: CourseOfferingWithDetails) => void;
  onViewStudents: (offering: CourseOfferingWithDetails) => void;
  isCurrentActiveSemester?: boolean;
}

export const OfferingCard: React.FC<OfferingCardProps> = ({
  offering,
  onEdit,
  onViewStudents,
  isCurrentActiveSemester = true,
}) => {
  const hasFaculty = Boolean(offering.first_name && offering.last_name);
  const fullName = hasFaculty
    ? formatFullName({
        first_name: offering.first_name!,
        middle_name: offering.middle_name ?? "",
        last_name: offering.last_name!,
        suffix: offering.suffix ?? "",
      })
    : "Unassigned Instructor";

  const initials = hasFaculty
    ? `${offering.first_name![0]}${offering.last_name![0]}`.toUpperCase()
    : "?";

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div className="h-1 w-full bg-linear-to-r from-sky-500/80 to-sky-500/30" />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 group-hover:scale-105 transition-transform">
              <BookOpen className="size-5" />
            </div>
            <div className="min-w-0">
              <Badge
                variant="outline"
                className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 bg-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/20"
              >
                {offering.course_initialism}
              </Badge>
              <h3 className="mt-1 text-sm font-bold text-foreground tracking-tight truncate leading-snug">
                {offering.course_name}
              </h3>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
              <DropdownMenuItem
                onClick={() => onViewStudents(offering)}
                className="cursor-pointer text-xs"
              >
                <Users className="mr-2 size-3.5 text-muted-foreground" /> View Students
              </DropdownMenuItem>

              {isCurrentActiveSemester && (
                <>
                  <DropdownMenuItem
                    onClick={() => onEdit(offering)}
                    className="cursor-pointer text-xs"
                  >
                    <Edit className="mr-2 size-3.5 text-muted-foreground" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <CourseOfferingDeleteDialog offering={offering} />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Assigned Instructor
          </p>

          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 border border-border/60 shrink-0">
              <AvatarFallback
                className={`text-xs font-semibold ${
                  hasFaculty ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60"
                }`}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-semibold truncate ${
                  hasFaculty ? "text-foreground" : "text-muted-foreground/60 italic"
                }`}
              >
                {fullName}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground truncate">
                ID: {offering.institutional_id || "Unassigned"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 p-3 px-5 bg-muted/10 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">
          Year {offering.year_level} • {offering.semester_term} Term
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewStudents(offering)}
          className="h-7 text-xs font-semibold gap-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-lg cursor-pointer"
        >
          <Users className="size-3.5" />
          <span>Class Roster</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
