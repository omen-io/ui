import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export type PaginatedCollection<T> = {
  items: T[]
  metadata: {
    total: number
    limit: number
    offset: number
  }
}

export type PaginatedTableQuery<OrderBy extends string> = {
  filter: string
  orderBy: OrderBy
  orderDirection: "asc" | "desc"
  limit: number
  offset: number
}

type PaginatedTableSpacerRowsProps = {
  itemCount: number
  pageSize: number
  columnCount: number
}

export function PaginatedTableSpacerRows({
  itemCount,
  pageSize,
  columnCount,
}: PaginatedTableSpacerRowsProps) {
  return Array.from(
    { length: Math.max(0, pageSize - itemCount) },
    (_, index) => (
      <tr aria-hidden="true" className="border-b" key={`spacer-${index}`}>
        <td className="p-3" colSpan={columnCount}>
          <span className="invisible">.</span>
        </td>
      </tr>
    ),
  )
}

type PaginatedTableLoader<T, OrderBy extends string> = (
  query: PaginatedTableQuery<OrderBy> & { signal: AbortSignal },
) => Promise<PaginatedCollection<T>>

export function usePaginatedTable<T, OrderBy extends string>(
  initialQuery: PaginatedTableQuery<OrderBy>,
  loadPage: PaginatedTableLoader<T, OrderBy>,
) {
  const [query, setQuery] = useState(initialQuery)
  const [response, setResponse] = useState<PaginatedCollection<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback((pageQuery: PaginatedTableQuery<OrderBy>) => {
    const controller = new AbortController()
    void loadPage({ ...pageQuery, signal: controller.signal })
      .then(setResponse)
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return
        }
        setError(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [loadPage])

  useEffect(() => load(query), [load, query])

  const updateQuery = (
    update: Partial<Omit<PaginatedTableQuery<OrderBy>, "offset">>,
  ) => {
    setLoading(true)
    setError(false)
    setQuery((current) => ({ ...current, ...update, offset: 0 }))
  }

  const setPage = (page: number) => {
    setLoading(true)
    setError(false)
    setQuery((current) => ({
      ...current,
      offset: Math.max(0, page) * current.limit,
    }))
  }

  const retry = () => {
    setLoading(true)
    setError(false)
    setQuery((current) => ({ ...current }))
  }

  const total = response?.metadata.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / query.limit))
  const currentPage = Math.min(
    Math.floor(query.offset / query.limit),
    pageCount - 1,
  )

  return {
    query,
    response,
    loading,
    error,
    retry,
    updateQuery,
    setPage,
    total,
    pageCount,
    currentPage,
  }
}

type PaginatedTablePaginationProps = {
  ariaLabel: string
  currentPage: number
  pageCount: number
  pageSizes: readonly number[]
  limit: number
  total: number
  firstItem: number
  lastItem: number
  onPageSizeChange: (limit: number) => void
  onPageChange: (page: number) => void
}

export function PaginatedTablePagination({
  ariaLabel,
  currentPage,
  pageCount,
  pageSizes,
  limit,
  total,
  firstItem,
  lastItem,
  onPageSizeChange,
  onPageChange,
}: PaginatedTablePaginationProps) {
  return (
    <footer className="flex flex-col gap-3 border-t p-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {firstItem}–{lastItem} of {total}
      </span>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          Per page
          <select
            aria-label={ariaLabel}
            className="h-7 border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={limit}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Previous page"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            size="icon-xs"
            variant="outline"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-16 text-center tabular-nums">
            Page {currentPage + 1} of {pageCount}
          </span>
          <Button
            aria-label="Next page"
            disabled={currentPage >= pageCount - 1}
            onClick={() => onPageChange(currentPage + 1)}
            size="icon-xs"
            variant="outline"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </footer>
  )
}
