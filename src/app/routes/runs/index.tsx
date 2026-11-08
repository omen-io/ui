import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaginatedTablePagination } from "@/components/ui/paginated-table"
import { RunsHeader } from "@/features/runs/components/runs-header"
import { RunsTable } from "@/features/runs/components/runs-table"
import { RunsToolbar } from "@/features/runs/components/runs-toolbar"
import { useRuns } from "@/features/runs/hooks/use-runs"

export default function RunsPage() {
  const runs = useRuns()
  const { query, response } = runs
  const firstItem = response && response.items.length > 0 ? query.offset + 1 : 0
  const lastItem = response
    ? Math.min(query.offset + response.items.length, response.metadata.total)
    : 0

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <RunsHeader />
        <Card>
          <CardHeader className="border-b">
            <CardTitle>All runs</CardTitle>
            <CardDescription>
              Search by run ID, experiment, source, or status.
            </CardDescription>
            <RunsToolbar
              onQueryChange={runs.updateQuery}
              query={query}
            />
          </CardHeader>
          <CardContent className="p-0">
            <RunsTable
              error={runs.error}
              hasResponse={Boolean(response)}
              items={response?.items}
              loading={runs.loading}
              onRetry={runs.retry}
              pageSize={query.limit}
            />
          </CardContent>
          {response && response.metadata.total > 0 && (
            <PaginatedTablePagination
              ariaLabel="Runs per page"
              currentPage={runs.currentPage}
              firstItem={firstItem}
              lastItem={lastItem}
              limit={query.limit}
              onPageChange={runs.setPage}
              onPageSizeChange={(limit) => runs.updateQuery({ limit })}
              pageCount={runs.pageCount}
              pageSizes={[10, 25, 50]}
              total={response.metadata.total}
            />
          )}
        </Card>
      </div>
    </main>
  )
}
