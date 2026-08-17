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
} from "lucide-react";

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
import type { UserWithDetails, SystemRole } from "backend/types/user.type";

interface UserCardProps {
  user: UserWithDetails;
  onViewProfile: (user: UserWithDetails) => void;
  onEdit: (user: UserWithDetails) => void;
  onDelete: (user: UserWithDetails) => void;
  canManage: boolean;
}

const roleBadgeStyles: Record<SystemRole, string> = {
  SYS_ADMIN: "border-red-500/30 bg-red-500/10 text-red-400 dark:text-red-300",
  ADMIN: "border-purple-500/30 bg-purple-500/10 text-purple-400 dark:text-purple-300",
  SUPERVISOR: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 dark:text-indigo-300",
  FACULTY: "border-blue-500/30 bg-blue-500/10 text-blue-400 dark:text-blue-300",
  STUDENT: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:text-emerald-300",
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
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      {/* Top Accent Line */}
      <div className="h-1 w-full bg-linear-to-r from-primary/80 to-primary/20" />

      {/* Header */}
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-11 border-2 border-border/60 shrink-0">
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
                {fullName}
              </h3>
              <p className="font-mono text-[11px] font-semibold text-muted-foreground mt-0.5">
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
                  className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => onViewProfile(user)}
                >
                  <Eye className="mr-2 size-3.5 text-muted-foreground" /> View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => onEdit(user)}>
                  <Pencil className="mr-2 size-3.5 text-muted-foreground" /> Edit User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => onDelete(user)}
                >
                  <Trash2 className="mr-2 size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Content: Roles & Info */}
      <CardContent className="p-5 pt-1 space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>

        {/* Roles Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {user.roles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className={`gap-1 px-2 py-0.5 text-[10px] font-medium font-mono ${
                roleBadgeStyles[role] ?? "border-border bg-muted text-muted-foreground"
              }`}
            >
              <Shield className="size-3" />
              {role.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </CardContent>

      {/* Footer CTA */}
      <CardFooter className="border-t border-border/40 p-3 px-5 bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px]">
          {user.is_verified ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="size-3" /> Unverified
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewProfile(user)}
          className="h-7 text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
        >
          <Eye className="size-3.5" />
          <span>Profile</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
