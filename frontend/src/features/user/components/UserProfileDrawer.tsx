import React from "react";
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatFullName } from "@/lib/nameFormatter";
import type { UserWithDetails, SystemRole } from "backend/types/user.type";

interface UserProfileDrawerProps {
  user: UserWithDetails | null;
  onClose: () => void;
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

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  user,
  onClose,
  onEdit,
  onDelete,
  canManage,
}) => {
  const isOpen = Boolean(user);
  if (!user) return null;

  const fullName = formatFullName({
    first_name: user.first_name,
    middle_name: user.middle_name ?? "",
    last_name: user.last_name,
    suffix: user.suffix ?? "",
  });

  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border border-border/80 bg-card shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border-2 border-border/60">
              <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0 flex-1">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground truncate">
                {fullName}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs font-semibold text-primary">
                {user.institutional_id || "No Institutional ID"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 text-xs">
          {/* Email & Verification */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                Email Address
              </span>
              {user.is_verified ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 gap-1 text-[10px]"
                >
                  <CheckCircle2 className="size-3" /> Verified
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-500 gap-1 text-[10px]"
                >
                  <AlertTriangle className="size-3" /> Unverified
                </Badge>
              )}
            </div>
            <p className="font-medium text-foreground flex items-center gap-2">
              <Mail className="size-3.5 text-muted-foreground shrink-0" />
              <span>{user.email}</span>
            </p>
          </div>

          {/* Assigned System Roles */}
          <div className="space-y-2">
            <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Assigned System Roles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.roles.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className={`gap-1.5 px-2.5 py-1 text-xs font-mono font-medium ${
                    roleBadgeStyles[role] ?? "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  <Shield className="size-3.5" />
                  {role.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>

          {/* Account Metadata */}
          <div className="pt-2 border-t border-border/40 text-muted-foreground space-y-1.5 text-[11px]">
            <p className="flex items-center gap-2">
              <User className="size-3.5 text-muted-foreground/70" />
              <span>Account ID: #{user.id}</span>
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="size-3.5 text-muted-foreground/70" />
              <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {canManage && (
          <div className="p-4 border-t bg-muted/20 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Pencil className="size-3.5 text-muted-foreground" /> Edit User
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(user);
              }}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
