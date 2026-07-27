import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatFullName } from "@/lib/nameFormatter";
import type { DeanCandidate } from "backend/types/college.types";

interface ExistingDeanSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  candidates: DeanCandidate[] | undefined;
  isSearching: boolean;
  selected: DeanCandidate | null;
  onSelect: (candidate: DeanCandidate) => void;
  onClear: () => void;
}

export function ExistingDeanSearch({
  search,
  onSearchChange,
  candidates,
  isSearching,
  selected,
  onSelect,
  onClear,
}: ExistingDeanSearchProps) {
  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
        <span>
          {formatFullName({
            first_name: selected.first_name,
            middle_name: selected.middle_name,
            last_name: selected.last_name,
            suffix: selected.suffix,
          })}
        </span>
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
    <Command className="max-w-sm rounded-lg border" shouldFilter={false}>
      <CommandInput
        placeholder="Search via name or institution ID..."
        value={search}
        onValueChange={onSearchChange}
      />
      <CommandList>
        {search.length < 2 ? (
          <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
        ) : isSearching ? (
          <CommandEmpty>Searching...</CommandEmpty>
        ) : !candidates?.length ? (
          <CommandEmpty>No matching faculty found.</CommandEmpty>
        ) : (
          <CommandGroup>
            {candidates.map((candidate) => (
              <CommandItem
                key={candidate.account_id}
                value={String(candidate.account_id)}
                disabled={candidate.is_college_dean}
                onSelect={() => onSelect(candidate)}
                className="flex items-center justify-between"
              >
                <span>
                  {formatFullName({
                    first_name: candidate.first_name,
                    middle_name: candidate.middle_name,
                    last_name: candidate.last_name,
                    suffix: candidate.suffix,
                  })}
                </span>
                {candidate.is_college_dean && (
                  <span className="text-xs text-muted-foreground">Already a dean</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
