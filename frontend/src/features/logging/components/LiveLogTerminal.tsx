import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Radio, Copy, Check, Pause, Play, Terminal, Filter } from "lucide-react";
import toast from "react-hot-toast";
import type { LogEntry } from "backend/utils/log-stream.util";
import { BACKEND_BASE_API } from "@/lib/api.lib";

type LevelFilter = "ALL" | "INFO" | "WARN" | "ERROR" | "HTTP";

const getLevelColor = (level: string) => {
  switch (level.toUpperCase()) {
    case "ERROR":
      return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    case "WARN":
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "HTTP":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    case "INFO":
    default:
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  }
};

const formatLogMessage = (message: string) => {
  // Highlight HTTP Methods & Status Codes
  return message
    .replace(/\b(GET|POST|PUT|PATCH|DELETE)\b/g, '<span class="font-bold text-sky-400">$1</span>')
    .replace(/\b(200|201|204)\b/g, '<span class="font-bold text-emerald-400">$1</span>')
    .replace(/\b(400|401|403|404)\b/g, '<span class="font-bold text-amber-400">$1</span>')
    .replace(/\b(500|502|503)\b/g, '<span class="font-bold text-rose-400">$1</span>')
    .replace(/(- \d+ms)/g, '<span class="text-zinc-500">$1</span>');
};

export const LiveLogTerminal = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<LevelFilter>("ALL");

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rawToken = localStorage.getItem("access_token") ?? "";
    const cleanToken = rawToken.replace(/^bearer\s+/i, "").trim();
    const streamUrl = `${BACKEND_BASE_API}/protected/logs/live${cleanToken ? `?token=${encodeURIComponent(cleanToken)}` : ""}`;

    const eventSource = new EventSource(streamUrl, {
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
          if (updated.length > 500) updated.shift(); // Keep max 500 lines in memory
          return updated;
        });
      } catch (err) {
        console.error("Failed to parse incoming log SSE payload:", err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Stream connection interrupted. Reconnecting...");
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive (if autoScroll enabled)
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return log.level.toUpperCase() === filter;
  });

  const levelCounts = {
    INFO: logs.filter((l) => l.level.toUpperCase() === "INFO").length,
    WARN: logs.filter((l) => l.level.toUpperCase() === "WARN").length,
    ERROR: logs.filter((l) => l.level.toUpperCase() === "ERROR").length,
    HTTP: logs.filter((l) => l.level.toUpperCase() === "HTTP").length,
  };

  const copyToClipboard = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}]: ${l.message}`)
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Terminal log buffer copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-0 shadow-2xl overflow-hidden font-mono">
      {/* IDE Terminal Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
        {/* Mac Window Dots & Stream Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Terminal className="size-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-200">backend-live.log</span>
          </div>

          <Badge
            variant="outline"
            className={`gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full ${
              isConnected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400"
            }`}
          >
            <Radio className={`size-3 ${isConnected ? "animate-pulse" : ""}`} />
            {isConnected ? "SSE LIVE" : error || "Offline"}
          </Badge>
        </div>

        {/* Level Counters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/60 p-1">
            <Filter className="size-3 text-zinc-500 ml-1" />
            {(["ALL", "INFO", "WARN", "ERROR", "HTTP"] as LevelFilter[]).map((lvl) => {
              const count =
                lvl === "ALL" ? logs.length : levelCounts[lvl as keyof typeof levelCounts];
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilter(lvl)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md cursor-pointer transition-all ${
                    filter === lvl
                      ? "bg-zinc-800 text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {lvl} ({count})
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Auto-scroll Freeze Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`h-7 px-2 text-[11px] font-medium cursor-pointer rounded-lg border border-zinc-800 ${
              autoScroll ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-400 bg-zinc-900"
            }`}
            title={autoScroll ? "Auto-scroll Enabled" : "Auto-scroll Paused"}
          >
            {autoScroll ? <Play className="size-3 mr-1" /> : <Pause className="size-3 mr-1" />}
            <span>{autoScroll ? "Auto-Scroll" : "Frozen"}</span>
          </Button>

          {/* Copy Buffer */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 size-7 p-0 cursor-pointer rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            title="Copy logs"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>

          {/* Clear Buffer */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            className="h-7 size-7 p-0 cursor-pointer rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
            title="Clear buffer"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="h-120 overflow-y-auto p-4 space-y-1 text-[11px] leading-relaxed text-zinc-300 selection:bg-zinc-800 selection:text-zinc-100">
        {filteredLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
            <Terminal className="size-8 stroke-1" />
            <p>Waiting for live backend log events...</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 hover:bg-zinc-900/60 p-0.5 rounded px-1 transition-colors"
            >
              <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>

              <Badge
                variant="outline"
                className={`text-[9px] font-mono px-1.5 py-0 h-4 uppercase shrink-0 ${getLevelColor(log.level)}`}
              >
                {log.level}
              </Badge>

              <span
                className="text-zinc-200 break-all flex-1"
                dangerouslySetInnerHTML={{ __html: formatLogMessage(log.message) }}
              />
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
