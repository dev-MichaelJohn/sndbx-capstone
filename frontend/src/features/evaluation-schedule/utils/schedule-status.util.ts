export type ScheduleStatus = "upcoming" | "active" | "closed";

export const getScheduleStatus = (
  openAt: string | Date,
  closeAt: string | Date,
): ScheduleStatus => {
  const now = new Date();
  const open = new Date(openAt);
  const close = new Date(closeAt);

  if (now < open) return "upcoming";
  if (now >= open && now <= close) return "active";
  return "closed";
};

export const formatScheduleDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatScheduleRange = (openAt: string | Date, closeAt: string | Date): string => {
  return `${formatScheduleDate(openAt)} – ${formatScheduleDate(closeAt)}`;
};
