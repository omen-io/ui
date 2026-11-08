import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { RunOrderBy, OrderDirection } from "../api"
import type { PaginatedTableQuery } from "@/components/ui/paginated-table"

type RunsToolbarProps = {
  query: PaginatedTableQuery<RunOrderBy>
  onQueryChange: (
    update: Partial<Omit<PaginatedTableQuery<RunOrderBy>, "offset">>,
  ) => void
}

const sortOptions: Array<{ value: RunOrderBy; label: string }> = [
  { value: "startedAt", label: "Started" },
  { value: "endedAt", label: "Ended" },
  { value: "experimentName", label: "Experiment" },
]

export function RunsToolbar({ query, onQueryChange }: RunsToolbarProps) {
  return (
    <div className="mt-3 flex flex-col gap-2 lg:flex-row">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
        <Input
          aria-label="Filter runs"
          className="pl-8"
          onChange={(event) => onQueryChange({ filter: event.target.value })}
          placeholder="Filter runs…"
          value={query.filter}
        />
      </label>
      <div className="flex gap-2">
        <select
          aria-label="Sort runs by"
          className="h-8 border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          onChange={(event) =>
            onQueryChange({ orderBy: event.target.value as RunOrderBy })
          }
          value={query.orderBy}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort direction"
          className="h-8 border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          onChange={(event) =>
            onQueryChange({
              orderDirection: event.target.value as OrderDirection,
            })
          }
          value={query.orderDirection}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  )
}
