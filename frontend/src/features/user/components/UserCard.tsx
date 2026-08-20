import React from "react";
import {
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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
import { cn } from "@/lib/utils";
import type { UserWithDetails, SystemRole } from "backend/types/user.type";

interface UserCardProps {
  user: UserWithDetails;
  onViewProfile: (user: UserWithDetails) => void;
  onEdit: (user: UserWithDetails) => void;
  onDelete: (user: UserWithDetails) => void;
  canManage: boolean;
}

const roleBadgeStyles: Record<SystemRole, string> = {
  SYS_ADMIN: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  ADMIN: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  SUPERVISOR: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  FACULTY: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  STUDENT: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onViewProfile,
  onEdit,
  onDelete,
  canManage,
}) => {
  const fullName = formatFullName({
    first_name: user.first_name,
    middle_name: user.middle_name ?? "",
    last_name: user.last_name,
    suffix: user.suffix ?? "",
  });

  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Top Identity Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="size-11 rounded-xl border border-border/80 shadow-2xs">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            {/* Online / Verification dot */}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ring-1 ring-border/20",
                user.is_verified ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
              {fullName}
            </h3>
            <p className="font-mono text-[11px] font-semibold text-muted-foreground mt-0.5 truncate">
              {user.institutional_id || "ID Pending"}
            </p>
          </div>
        </div>

        {canManage && (
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
              className="w-40 rounded-xl p-1 shadow-lg border-border/80"
            >
              <DropdownMenuItem
                className="cursor-pointer text-xs gap-2 py-1.5"
                onClick={() => onViewProfile(user)}
              >
                <Eye className="size-3.5 text-muted-foreground" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-xs gap-2 py-1.5"
                onClick={() => onEdit(user)}
              >
                <Pencil className="size-3.5 text-muted-foreground" /> Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-xs gap-2 py-1.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="size-3.5" /> Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Middle: Email & Roles */}
      <div className="my-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
          <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span className="truncate">{user.email}</span>
        </div>

        {/* Roles Badges */}
        <div className="flex flex-wrap gap-1.5">
          {user.roles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className={cn(
                "gap-1 px-2 py-0.5 text-[10px] font-semibold font-mono rounded-md shadow-2xs",
                roleBadgeStyles[role] ?? "border-border bg-muted text-muted-foreground",
              )}
            >
              <Shield className="size-2.5" />
              {role.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer: Verification Status + Profile CTA */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {user.is_verified ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5" /> Unverified
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewProfile(user)}
          className="h-7 text-xs font-bold gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer active:scale-[0.96]"
        >
          <span>Profile</span>
          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};
