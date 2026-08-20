import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Shield } from "lucide-react";
import type { SystemRole } from "backend/types/user.type";

interface RoleHeroBannerProps {
  name: string;
  institutionalId?: string;
  role: SystemRole;
  activeTerm?: string;
  subtitle?: string;
}

const roleMeta: Record<SystemRole, { title: string; color: string }> = {
  SYS_ADMIN: {
    title: "System Administration Console",
    color: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  ADMIN: {
    title: "Administrative Management Portal",
    color: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
  SUPERVISOR: {
    title: "Supervisor Jurisdiction Portal",
    color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  },
  FACULTY: {
    title: "Faculty Instruction Portal",
    color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  STUDENT: {
    title: "Student Evaluation Portal",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
};

export const RoleHeroBanner: React.FC<RoleHeroBannerProps> = ({
  name,
  institutionalId = "N/A",
  role,
  activeTerm,
  subtitle,
}) => {
  const meta = roleMeta[role] ?? roleMeta.STUDENT;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge
          variant="outline"
          className={`gap-1.5 text-xs font-semibold px-2.5 py-1 ${meta.color}`}
        >
          <Shield className="size-3.5" />
          {meta.title}
        </Badge>

        {activeTerm && (
          <Badge variant="outline" className="gap-1 font-mono text-[11px] text-foreground bg-card/80 px-2 py-0.5">
            <Calendar className="size-3 text-muted-foreground" />
            {activeTerm}
          </Badge>
        )}

        <span className="font-mono text-[11px] text-muted-foreground">ID: {institutionalId}</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
        Welcome back, {name}!
      </h1>

      {subtitle && (
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
