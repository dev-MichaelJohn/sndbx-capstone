import React from "react";
import { Link } from "react-router";
import {
  Building2,
  User,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2,
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
import { CollegeEditDialog } from "./CollegeEdit";
import { CollegeDeleteDialog } from "./CollegeDelete";
import type { CollegeWithDean } from "backend/types/college.types";

interface CollegeCardProps {
  college: CollegeWithDean;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college }) => {
  const deanName = formatFullName({
    first_name: college.first_name,
    last_name: college.last_name,
    middle_name: college.middle_name,
    suffix: college.suffix,
  });

  const initials = `${college.first_name?.[0] ?? ""}${college.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:scale-105 transition-transform duration-200">
            <Building2 className="size-5.5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <Badge
              variant="outline"
              className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 bg-primary/5 text-primary border-primary/20"
            >
              {college.initialism}
            </Badge>
            <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
              {college.name}
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
              className="cursor-pointer p-0 focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <CollegeEditDialog icon={Pencil} triggerText="Edit College" defaultData={college} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer p-0 focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <CollegeDeleteDialog college={college} icon={Trash2} triggerText="Delete College" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle: Dean Leadership Status */}
      <div className="my-4 rounded-xl border border-border/50 bg-muted/20 p-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          <span>College Dean</span>
          {deanName && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
              <ShieldCheck className="size-3" /> assigned
            </span>
          )}
        </div>

        {deanName ? (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7.5 rounded-lg border border-border/60 shrink-0">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{deanName}</p>
              <p className="font-mono text-[10px] text-muted-foreground truncate">
                ID: {college.institutional_id || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground italic py-0.5">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" /> Dean unassigned
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
            >
              Needs Dean
            </Badge>
          </div>
        )}
      </div>

      {/* Footer Navigation CTA */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">Degree Programs</span>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-7 text-xs font-bold gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer active:scale-[0.96]"
        >
          <Link to={`${college.id}/programs`}>
            <span>Explore Programs</span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};
