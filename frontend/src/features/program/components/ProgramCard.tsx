import React from "react";
import { Link } from "react-router";
import { GraduationCap, User, ArrowRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { ProgramEditDialog } from "./ProgramEdit";
import { ProgramDeleteDialog } from "./ProgramDelete";
import type { ProgramWithChairType } from "backend/types/program.type";

interface ProgramCardProps {
  program: ProgramWithChairType;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const chairName = program.account_id
    ? formatFullName({
        first_name: program.first_name,
        last_name: program.last_name,
        middle_name: program.middle_name,
        suffix: program.suffix,
      })
    : null;

  const initials = `${program.first_name?.[0] ?? ""}${program.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div className="h-1 w-full bg-linear-to-r from-violet-500/80 to-violet-500/30" />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 group-hover:scale-105 transition-transform">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0">
              <Badge
                variant="outline"
                className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 bg-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/20"
              >
                {program.initialism}
              </Badge>
              <h3 className="mt-1 text-sm font-bold text-foreground tracking-tight truncate leading-snug">
                {program.name}
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
                className="cursor-pointer p-0 focus:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <ProgramEditDialog icon={Pencil} triggerText="Edit Program" defaultData={program} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer p-0 focus:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <ProgramDeleteDialog icon={Trash2} triggerText="Delete" program={program} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Program Chair
          </p>

          {chairName ? (
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8 border border-border/60 shrink-0">
                <AvatarFallback className="bg-violet-500/10 text-xs font-semibold text-violet-500">
                  {initials || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{chairName}</p>
                <p className="font-mono text-[10px] text-muted-foreground truncate">
                  ID: {program.institutional_id || "N/A"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-muted-foreground/70 italic py-0.5">
              <span className="flex items-center gap-1.5">
                <User className="size-3.5" /> Chair unassigned
              </span>
              <Badge
                variant="outline"
                className="text-[9px] border-amber-500/30 text-amber-500 bg-amber-500/5"
              >
                Needs Chair
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 p-3 px-5 bg-muted/10 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">
          {program.student_count ?? 0} Enrolled Students
        </span>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-7 text-xs font-semibold gap-1.5 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 rounded-lg cursor-pointer"
        >
          <Link to={String(program.id)}>
            <span>View Details</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
