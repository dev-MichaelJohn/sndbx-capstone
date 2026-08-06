import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";

export const LiveFeedHeader = () => {
  return (
    <CardHeader className="border-b pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mt-0.5">
            <Activity className="size-4 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Live Evaluation Feed</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Real-time campus submission stream
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          LIVE
        </div>
      </div>
    </CardHeader>
  );
};
