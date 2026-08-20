import React from "react";
import { Link } from "react-router";
import {
  GraduationCap,
  User,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
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
    <Card className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-2xs group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="size-5.5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <Badge
              variant="outline"
              className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 bg-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/20"
            >
              {program.initialism}
            </Badge>
            <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
              {program.name}
            </h3>
          </div>
        </div>

        {/* Dropdown Menu */}
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
              <ProgramDeleteDialog icon={Trash2} triggerText="Delete Program" program={program} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle: Program Chair Status */}
      <div className="my-4 rounded-xl border border-border/50 bg-muted/20 p-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          <span>Program Chair</span>
          {chairName && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
              <ShieldCheck className="size-3" /> assigned
            </span>
          )}
        </div>

        {chairName ? (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7.5 rounded-lg border border-border/60 shrink-0">
              <AvatarFallback className="bg-violet-500/10 text-xs font-bold text-violet-600 dark:text-violet-400">
                {initials || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{chairName}</p>
              <p className="font-mono text-[10px] text-muted-foreground truncate">
                ID: {program.institutional_id || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground italic py-0.5">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" /> Chair unassigned
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
            >
              Needs Chair
            </Badge>
          </div>
        )}
      </div>

      {/* Footer Details CTA */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
          <Users className="size-3.5 text-muted-foreground/70" />
          <span>{program.student_count ?? 0} Students</span>
        </span>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-7 text-xs font-bold gap-1 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 rounded-lg cursor-pointer active:scale-[0.96]"
        >
          <Link to={String(program.id)}>
            <span>View Details</span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};
