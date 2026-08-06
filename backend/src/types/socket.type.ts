export interface AnonymousSubmissionEvent {
  id: string;
  evaluator_type: "STUDENT" | "SUPERVISOR";
  faculty_name: string;
  course_initialism: string;
  course_name: string;
  submitted_at: string;
}

export interface ServerToClientEvents {
  "evaluation:submitted": (data: AnonymousSubmissionEvent) => void;
}

export interface ClientToServerEvents {
  "sys-admin:join": () => void;
}
