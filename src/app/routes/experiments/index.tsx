import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaginatedTablePagination } from "@/components/ui/paginated-table"
import { ExperimentsHeader } from "@/features/experiments/components/experiments-header"
import { ExperimentsTable } from "@/features/experiments/components/experiments-table"
import { ExperimentsToolbar } from "@/features/experiments/components/experiments-toolbar"
import { useExperiments } from "@/features/experiments/hooks/use-experiments"

export default function ExperimentsPage() {
  const experiments = useExperiments()
  const { query, response } = experiments
  const firstItem = response && response.items.length > 0
    ? query.offset + 1
    : 0
  const lastItem = response
    ? Math.min(query.offset + response.items.length, response.metadata.total)
    : 0

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ExperimentsHeader />
        <Card>
          <CardHeader className="border-b">
            <CardTitle>All experiments</CardTitle>
            <CardDescription>
              Search by ID, name, or source. Use <code>name:checkout</code> for a focused filter.
            </CardDescription>
            <ExperimentsToolbar
              onQueryChange={experiments.updateQuery}
              query={query}
            />
          </CardHeader>
          <CardContent className="p-0">
            <ExperimentsTable
              error={experiments.error}
              hasResponse={Boolean(response)}
              items={response?.items}
              loading={experiments.loading}
              onRetry={experiments.retry}
              pageSize={query.limit}
            />
          </CardContent>
          {response && response.metadata.total > 0 && (
            <PaginatedTablePagination
              ariaLabel="Experiments per page"
              currentPage={experiments.currentPage}
              firstItem={firstItem}
              lastItem={lastItem}
              limit={query.limit}
              onPageChange={experiments.setPage}
              onPageSizeChange={(limit) => experiments.updateQuery({ limit })}
              pageSizes={[10, 25, 50]}
              pageCount={experiments.pageCount}
              total={response.metadata.total}
            />
          )}
        </Card>
      </div>
    </main>
  )
}
