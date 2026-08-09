import { useState, useRef } from "react";
import {
  Download,
  FileSpreadsheet,
  AlertCircle,
  UploadCloud,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Info,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CSV_TEMPLATES, downloadCsvTemplate } from "../utils/csv-templates";
import { useExecuteBulkImport } from "../api/bulk-import.service";
import type { BulkEntity, BulkImportResult } from "backend/types/bulk-import.type";

interface CSVImportDialogProps {
  entity: BulkEntity;
  title: string;
  triggerText?: string;
  defaultContext?: Record<string, any>;
  onSuccess?: () => void;
}

export const CSVImportDialog = ({
  entity,
  title,
  triggerText = "Import CSV",
  defaultContext,
  onSuccess,
}: CSVImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmImportOpen, setConfirmImportOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const template = CSV_TEMPLATES[entity];
  const importMutation = useExecuteBulkImport(entity);

  const processFile = (uploadedFile: File) => {
    if (!uploadedFile.name.endsWith(".csv")) {
      toast.error("Please upload a valid .csv file.");
      return;
    }

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        toast.error("CSV file must contain a header row and at least one data row.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const rowObj: Record<string, any> = { ...defaultContext };
        headers.forEach((h, idx) => {
          if (values[idx] !== undefined && values[idx] !== "") {
            rowObj[h] = values[idx];
          }
        });
        return rowObj;
      });

      setParsedRows(rows);
      setImportResult(null);
    };

    reader.readAsText(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttemptImport = () => {
    if (parsedRows.length === 0) return;
    setConfirmImportOpen(true);
  };

  const handleConfirmImport = async () => {
    setConfirmImportOpen(false);
    if (parsedRows.length === 0) return;

    try {
      const res = await importMutation.mutateAsync(parsedRows);
      setImportResult(res);

      if (res.failedCount === 0) {
        toast.success(`Successfully imported ${res.successCount} record(s)!`);
      } else {
        toast.error(`Import completed with ${res.failedCount} error(s).`);
      }

      if (res.successCount > 0) {
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to execute bulk import.");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      handleClearFile();
    }
  };

  // Helper map for row error lookup
  const rowErrorMap = new Map<number, string>();
  if (importResult?.errors) {
    importResult.errors.forEach((err) => {
      rowErrorMap.set(err.row, err.message);
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer border-border/70 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-all rounded-lg"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-500" />
            <span>{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-border/60 bg-card shadow-2xl">
          {/* Header */}
          <DialogHeader className="p-5 border-b bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <FileSpreadsheet className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Batch import records into the system via formatted `.csv` upload.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCsvTemplate(entity)}
              className="h-8 text-xs gap-1.5 cursor-pointer shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <Download className="size-3.5 text-emerald-500" />
              <span>Sample Template</span>
            </Button>
          </DialogHeader>

          <ScrollArea className="flex-1 p-5">
            <div className="space-y-4">
              {/* Template Format Specifications */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Info className="size-3.5 text-primary" />
                    <span>Required CSV Headers</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] px-1.5 py-0 border-border/60"
                  >
                    CSV Spec
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {template.headers.map((header) => (
                    <Badge
                      key={header}
                      variant="secondary"
                      className="font-mono text-[10px] px-2 py-0.5 bg-background border border-border/50 text-foreground"
                    >
                      {header}
                    </Badge>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground/80 italic leading-relaxed">
                  {template.instructions}
                </p>
              </div>

              {/* Upload Zone */}
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl border border-dashed
                    p-6 text-center cursor-pointer transition-all duration-200
                    ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border/70 bg-muted/10 hover:border-emerald-500/40 hover:bg-muted/20"
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const uploaded = e.target.files?.[0];
                      if (uploaded) processFile(uploaded);
                    }}
                    className="hidden"
                  />

                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
                    <UploadCloud className="size-5" />
                  </div>

                  <p className="text-xs font-medium text-foreground">
                    Click or drag <span className="text-emerald-500 font-semibold">.csv</span> file
                    here
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Maximum file size 5MB</p>
                </div>
              ) : (
                /* Selected File Card */
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows loaded
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFile}
                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}

              {/* Data Table Preview */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-500" />
                      Parsed Rows ({parsedRows.length})
                    </span>
                    {importResult && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          importResult.failedCount === 0
                            ? "border-emerald-500/30 text-emerald-400"
                            : "border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {importResult.successCount} OK / {importResult.failedCount} Errors
                      </Badge>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
                    <ScrollArea className="max-h-48 w-full">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-8 text-[10px] font-semibold text-center">
                              #
                            </TableHead>
                            {template.headers.map((h) => (
                              <TableHead key={h} className="text-[10px] font-semibold">
                                {h}
                              </TableHead>
                            ))}
                            {importResult && (
                              <TableHead className="w-20 text-[10px] font-semibold text-right">
                                Status
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedRows.map((row, idx) => {
                            const rowNum = idx + 1;
                            const rowError = rowErrorMap.get(rowNum);

                            return (
                              <TableRow key={idx} className="hover:bg-muted/20">
                                <TableCell className="font-mono text-[10px] text-center text-muted-foreground">
                                  {rowNum}
                                </TableCell>
                                {template.headers.map((h) => (
                                  <TableCell key={h} className="text-xs font-mono">
                                    {row[h] || (
                                      <span className="text-muted-foreground/30 italic">—</span>
                                    )}
                                  </TableCell>
                                ))}
                                {importResult && (
                                  <TableCell className="text-right">
                                    {rowError ? (
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] border-rose-500/30 text-rose-400 bg-rose-500/5"
                                      >
                                        Error
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                                      >
                                        Imported
                                      </Badge>
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {/* Error Callout Summary */}
              {importResult && importResult.errors.length > 0 && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-2 text-xs text-rose-400">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>Row Validation Failures</span>
                  </div>
                  <ScrollArea className="max-h-28">
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px] font-mono text-rose-300">
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>
                          Row {err.row}: {err.message}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <DialogFooter className="p-4 border-t bg-muted/15 flex flex-row items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={importMutation.isPending}
              className="h-8 rounded-lg text-xs"
            >
              Close
            </Button>

            <Button
              type="button"
              onClick={handleAttemptImport}
              disabled={parsedRows.length === 0 || importMutation.isPending}
              className="h-8 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 cursor-pointer"
            >
              {importMutation.isPending ? (
                <span>Importing...</span>
              ) : (
                <>
                  <span>Execute Bulk Import</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Friction Confirmation Modal */}
      <AlertDialog open={confirmImportOpen} onOpenChange={setConfirmImportOpen}>
        <AlertDialogContent className="rounded-xl border border-border/80 bg-card shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <ShieldAlert className="size-4 text-amber-500 shrink-0" />
              <span>Confirm Bulk CSV Import?</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2.5 pt-1 text-xs text-muted-foreground">
                <p>
                  You are about to batch import{" "}
                  <strong className="text-foreground font-semibold">
                    {parsedRows.length} record(s)
                  </strong>{" "}
                  into <strong className="text-primary font-semibold uppercase">{entity}</strong>.
                </p>

                {defaultContext && Object.keys(defaultContext).length > 0 && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 font-mono text-[11px] text-primary">
                    Bound Context: {JSON.stringify(defaultContext)}
                  </div>
                )}

                <p className="italic text-muted-foreground/80">
                  New records will be created in the database. Proceed?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={importMutation.isPending}
              className="h-8 rounded-lg text-xs"
            >
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              disabled={importMutation.isPending}
              className="h-8 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500 cursor-pointer"
            >
              {importMutation.isPending ? "Importing..." : "Yes, Execute Import"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
