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
import type { ChairCandidateType } from "backend/types/program.type";

interface ExistingChairSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  candidates: ChairCandidateType[] | undefined;
  isSearching: boolean;
  selected: ChairCandidateType | null;
  onSelect: (candidate: ChairCandidateType) => void;
  onClear: () => void;
}

export function ExistingChairSearch({
  search,
  onSearchChange,
  candidates,
  isSearching,
  selected,
  onSelect,
  onClear,
}: ExistingChairSearchProps) {
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
    <Command className="w-full rounded-lg border" shouldFilter={false}>
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
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
