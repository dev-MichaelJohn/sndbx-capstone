import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationData {
  currentPage: number;
  totalPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TablePaginationProps {
  pagination?: PaginationData;
  isPending: boolean;
  onPageChange: (newPage: number) => void;
}

export const TablePagination = ({ pagination, isPending, onPageChange }: TablePaginationProps) => {
  if (!pagination) {
    return (
      <div className="shrink-0 border-t bg-card px-6 py-3">
        <span className="text-xs text-muted-foreground">Loading page info...</span>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Page {pagination.currentPage} of {pagination.totalPage}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 rounded-lg p-0"
            onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
            disabled={!pagination.hasPrev || isPending}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
            {pagination.currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 rounded-lg p-0"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext || isPending}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
