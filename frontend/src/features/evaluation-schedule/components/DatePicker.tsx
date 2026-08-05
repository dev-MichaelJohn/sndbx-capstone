import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
}

export const DatePicker = ({
  value,
  onChange,
  disabled,
  hasError,
  placeholder = "Pick a date",
}: DatePickerProps) => {
  const dateVal = value ? new Date(value) : undefined;

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal text-xs h-9 min-w-0",
            !dateVal && "text-muted-foreground",
            hasError && "border-destructive text-destructive focus-visible:ring-destructive",
          )}
        >
          <CalendarIcon className="mr-2 size-3.5 shrink-0" />
          {dateVal ? (
            dateVal.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={dateVal} onSelect={handleSelectDate} />
      </PopoverContent>
    </Popover>
  );
};
