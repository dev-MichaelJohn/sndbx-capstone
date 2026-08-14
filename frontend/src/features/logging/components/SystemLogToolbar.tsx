import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { LogFile } from "../api/log.service";

interface SystemLogToolbarProps {
  file: LogFile;
  onFileChange: (file: LogFile) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const SystemLogToolbar = ({
  file,
  onFileChange,
  search,
  onSearchChange,
}: SystemLogToolbarProps) => {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={file} onValueChange={(val) => onFileChange(val as LogFile)}>
          <SelectTrigger className="h-8 w-40 rounded-lg text-xs">
            <SelectValue placeholder="Select log file" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="combined" className="text-xs">
              combined.txt
            </SelectItem>
            <SelectItem value="error" className="text-xs">
              error.txt
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 rounded-lg pl-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
