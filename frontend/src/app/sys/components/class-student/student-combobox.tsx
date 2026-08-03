import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/features/api.config";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentOption {
  id: number;
  institutional_id: string;
  full_name: string;
}

interface StudentComboboxProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export const StudentCombobox = ({ value, onChange, error }: StudentComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["searchStudents", search],
    queryFn: async () => {
      const response = await apiClient.get("/protected/users", {
        params: { search, role: "STUDENT", page: 1, limit: 10 },
      });
      return response.data.data.data as StudentOption[];
    },
    enabled: open,
  });

  const selectedStudent = students.find((s) => s.id === value);

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedStudent
              ? `${selectedStudent.full_name} (${selectedStudent.institutional_id})`
              : "Select student..."}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search student by name or ID..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading && (
                <div className="p-4 text-xs text-center text-muted-foreground">
                  Loading students...
                </div>
              )}
              <CommandEmpty>No students found.</CommandEmpty>
              <CommandGroup>
                {students.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={String(student.id)}
                    onSelect={() => {
                      onChange(student.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === student.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{student.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {student.institutional_id}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
