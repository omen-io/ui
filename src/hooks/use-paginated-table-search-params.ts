import type { PaginatedTableQuery } from "@/components/ui/paginated-table"

export type PaginatedTableSearchParamsConfig<OrderBy extends string> = {
  defaults: PaginatedTableQuery<OrderBy>
  orderByValues: readonly OrderBy[]
  pageSizes: readonly number[]
}

const isOrderDirection = (
  value: string | null,
): value is PaginatedTableQuery<string>["orderDirection"] =>
  value === "asc" || value === "desc"

const parseNonNegativeInteger = (
  value: string | null,
  fallback: number,
) => {
  if (value === null || !/^\d+$/.test(value)) {
    return fallback
  }

  return Number(value)
}

export function parsePaginatedTableSearchParams<OrderBy extends string>(
  params: URLSearchParams,
  config: PaginatedTableSearchParamsConfig<OrderBy>,
): PaginatedTableQuery<OrderBy> {
  const { defaults } = config
  const orderBy = params.get("orderBy")
  const orderDirection = params.get("orderDirection")
  const limit = parseNonNegativeInteger(params.get("limit"), defaults.limit)

  return {
    filter: params.get("filter") ?? defaults.filter,
    orderBy:
      orderBy && config.orderByValues.includes(orderBy as OrderBy)
        ? (orderBy as OrderBy)
        : defaults.orderBy,
    orderDirection: isOrderDirection(orderDirection)
      ? orderDirection
      : defaults.orderDirection,
    limit: config.pageSizes.includes(limit) ? limit : defaults.limit,
    offset: parseNonNegativeInteger(params.get("offset"), defaults.offset),
  }
}

export function serializePaginatedTableSearchParams<OrderBy extends string>(
  query: PaginatedTableQuery<OrderBy>,
  config: PaginatedTableSearchParamsConfig<OrderBy>,
) {
  const { defaults } = config
  const params = new URLSearchParams()

  if (query.filter !== defaults.filter) {
    params.set("filter", query.filter)
  }
  if (query.orderBy !== defaults.orderBy) {
    params.set("orderBy", query.orderBy)
  }
  if (query.orderDirection !== defaults.orderDirection) {
    params.set("orderDirection", query.orderDirection)
  }
  if (query.limit !== defaults.limit) {
    params.set("limit", String(query.limit))
  }
  if (query.offset !== defaults.offset) {
    params.set("offset", String(query.offset))
  }

  return params
}
