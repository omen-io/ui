import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type {
  ExperimentOrderBy,
  OrderDirection,
} from "@/features/experiments/api"
import type { ExperimentListState } from "../hooks/use-experiments"

const sortOptions: Array<{ value: ExperimentOrderBy; label: string }> = [
  { value: "date", label: "Updated" },
  { value: "name", label: "Name" },
  { value: "runCount", label: "Runs" },
]

type ExperimentsToolbarProps = {
  query: ExperimentListState
  onQueryChange: (
    update: Partial<Omit<ExperimentListState, "offset">>,
  ) => void
}

export function ExperimentsToolbar({
  query,
  onQueryChange,
}: ExperimentsToolbarProps) {
  return (
    <div className="mt-3 flex flex-col gap-2 lg:flex-row">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
        <Input
          aria-label="Filter experiments"
          className="pl-8"
          onChange={(event) => onQueryChange({ filter: event.target.value })}
          placeholder="Filter experiments…"
          value={query.filter}
        />
      </label>
      <div className="flex gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="sr-only">Sort by</span>
          <select
            aria-label="Sort experiments by"
            className="h-8 border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            onChange={(event) =>
              onQueryChange({
                orderBy: event.target.value as ExperimentOrderBy,
              })
            }
            value={query.orderBy}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
