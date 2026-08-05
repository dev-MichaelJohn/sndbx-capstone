import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { EligibleStudentOption } from "backend/types/student-class.type";

interface EligibleStudentSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  students: EligibleStudentOption[] | undefined;
  isLoading: boolean;
  selected: EligibleStudentOption | null;
  onSelect: (student: EligibleStudentOption) => void;
  onClear: () => void;
}

export function EligibleStudentSearch({
  search,
  onSearchChange,
  students,
  isLoading,
  selected,
  onSelect,
  onClear,
}: EligibleStudentSearchProps) {
  if (selected) {
    const sectionBadge =
      selected.program_name && selected.class_year_level && selected.class_section
        ? `${selected.program_name} ${selected.class_year_level}-${selected.class_section}`
        : "Irregular / Unassigned";

    return (
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{selected.student_name}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({selected.institutional_id})
            </span>
          </div>
          <span className="w-fit rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {sectionBadge}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 cursor-pointer rounded-lg px-2 text-xs hover:bg-background"
          onClick={onClear}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <Command className="w-full rounded-xl border shadow-xs" shouldFilter={false}>
      <CommandInput
        placeholder="Search student name or ID..."
        value={search}
        onValueChange={onSearchChange}
        className="text-xs"
      />
      <CommandList className="max-h-56">
        {isLoading ? (
          <CommandEmpty className="py-4 text-xs text-muted-foreground">
            Searching student records...
          </CommandEmpty>
        ) : !students?.length ? (
          <CommandEmpty className="py-4 text-xs text-muted-foreground">
            No eligible students found.
          </CommandEmpty>
        ) : (
          <CommandGroup>
            {students.map((student) => {
              const homeSection =
                student.program_name && student.class_year_level && student.class_section
                  ? `${student.program_name} ${student.class_year_level}-${student.class_section}`
                  : "Irregular / Unassigned";

              return (
                <CommandItem
                  key={student.student_account_id}
                  value={String(student.student_account_id)}
                  onSelect={() => onSelect(student)}
                  className="flex cursor-pointer items-center justify-between py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {student.student_name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {student.institutional_id}
                    </span>
                  </div>
                  <span className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {homeSection}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
