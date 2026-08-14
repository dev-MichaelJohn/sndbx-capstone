import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Radio } from "lucide-react";
import type { LogEntry } from "backend/utils/log-stream.util";
import { BACKEND_BASE_API } from "@/lib/api.lib";

export const LiveLogTerminal = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${BACKEND_BASE_API}/protected/logs/live`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "CONNECTED") return;

        setLogs((prev) => {
          const updated = [...prev, data];
          if (updated.length > 300) updated.shift();
          return updated;
        });
      } catch (err) {
        console.error("Failed to parse incoming log SSE payload:", err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Connection to live stream lost. Reconnecting...");
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  const clearLogs = () => setLogs([]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Radio
            className={`size-4 ${isConnected ? "text-emerald-500 animate-pulse" : "text-destructive"}`}
          />
          <span className="text-xs font-medium text-foreground">
            {isConnected ? "Live Backend Log Stream Active" : error || "Connecting to stream..."}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearLogs}
          className="h-8 cursor-pointer gap-1.5 rounded-lg text-xs font-medium"
        >
          <Trash2 className="size-3.5" />
          Clear Buffer
        </Button>
      </div>

      <div className="rounded-xl border bg-zinc-950 text-zinc-50 p-4 font-mono text-xs h-130 overflow-y-auto shadow-inner flex flex-col gap-1.5">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500">
            Waiting for live log events...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-3 leading-relaxed border-b border-zinc-900 pb-1">
              <span className="text-zinc-500 select-none">[{log.timestamp}]</span>
              <Badge
                variant="outline"
                className="text-[10px] h-5 text-zinc-300 border-zinc-800 font-mono uppercase"
              >
                {log.level}
              </Badge>
              <span className="text-zinc-200 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
