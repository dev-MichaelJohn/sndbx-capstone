import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/table-pagination";
import { History, Terminal } from "lucide-react";

import { useSystemLogs, type LogFile } from "../api/log.service";
import { SystemLogToolbar } from "../components/SystemLogToolbar";
import { HistoricalLogsList } from "../components/HistoricalLogsList";
import { LiveLogTerminal } from "../components/LiveLogTerminal";

export const SystemLogsPage = () => {
  const [file, setFile] = useState<LogFile>("combined");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    data: logResponse,
    isPending,
    isError,
    error,
  } = useSystemLogs({
    file,
    page,
    limit: 20,
    search: search.trim() || undefined,
  });

  const logs = logResponse?.data ?? [];

  const handleFileChange = (newFile: LogFile) => {
    setFile(newFile);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              System Logs
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Monitor server activity via historical log files or real-time SSE streams.
            </p>
          </div>
        </div>

        <Tabs defaultValue="historical" className="space-y-4">
          <TabsList className="grid h-9 w-full grid-cols-2 rounded-lg bg-muted/60 p-1 sm:w-64">
            <TabsTrigger value="historical" className="gap-2 rounded-md text-xs font-medium">
              <History className="size-3.5" />
              Historical Logs
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2 rounded-md text-xs font-medium">
              <Terminal className="size-3.5" />
              Live Stream
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historical" className="space-y-4 mt-0">
            <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card shadow-xs">
              <SystemLogToolbar
                file={file}
                onFileChange={handleFileChange}
                search={search}
                onSearchChange={handleSearchChange}
              />

              <CardContent className="p-4">
                <HistoricalLogsList
                  logs={logs}
                  isLoading={isPending}
                  isError={isError}
                  error={error}
                />
              </CardContent>
            </Card>

            <TablePagination
              pagination={logResponse?.pagination}
              isPending={isPending}
              onPageChange={setPage}
            />
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            <LiveLogTerminal />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemLogsPage;
