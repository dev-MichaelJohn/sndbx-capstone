import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatFullName } from "@/srcx/lib/nameFormatter";

export interface StudentUser {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  suffix?: string | null;
  institutional_id?: string | null;
}

interface ExistingStudentSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  users: StudentUser[] | undefined;
  isSearching: boolean;
  selected: StudentUser | null;
  onSelect: (user: StudentUser) => void;
  onClear: () => void;
}

export function ExistingStudentSearch({
  search,
  onSearchChange,
  users,
  isSearching,
  selected,
  onSelect,
  onClear,
}: ExistingStudentSearchProps) {
  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span>
            {formatFullName({
              first_name: selected.first_name,
              middle_name: selected.middle_name ?? "",
              last_name: selected.last_name,
              suffix: selected.suffix ?? "",
            })}
          </span>
          {selected.institutional_id && (
            <span className="text-xs text-muted-foreground">({selected.institutional_id})</span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onClear}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <Command className="w-full rounded-lg border" shouldFilter={false}>
      <CommandInput
        placeholder="Search student name or institutional ID..."
        value={search}
        onValueChange={onSearchChange}
      />
      <CommandList>
        {search.length < 2 ? (
          <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
        ) : isSearching ? (
          <CommandEmpty>Searching student records...</CommandEmpty>
        ) : !users?.length ? (
          <CommandEmpty>No matching students found.</CommandEmpty>
        ) : (
          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={String(user.id)}
                onSelect={() => onSelect(user)}
                className="flex items-center justify-between"
              >
                <span>
                  {formatFullName({
                    first_name: user.first_name,
                    middle_name: user.middle_name ?? "",
                    last_name: user.last_name,
                    suffix: user.suffix ?? "",
                  })}
                </span>
                {user.institutional_id && (
                  <span className="text-xs text-muted-foreground">{user.institutional_id}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
