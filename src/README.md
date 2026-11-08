# Omen UI technical guide

This document describes the current implementation. Read it before changing
application structure, transport contracts, fixture data, or dashboard
behavior. The root [`README.md`](../README.md) explains the product and
contribution context for people who do not need implementation detail.

## Runtime shape

Omen UI is a React 19 single-page application built with TypeScript, Vite,
React Router, Tailwind CSS, shadcn/ui primitives, Recharts, and MSW. The
browser can run in two modes:

```text
feature API module -> src/lib/http-client.ts -> fetch
                                      |
                         fixture mode: MSW intercepts fetch
                         real mode: request reaches the API
```

`src/main.tsx` reads the typed configuration from `src/config/env.ts`. In
fixture mode it dynamically imports `src/testing/browser`, starts the worker,
and only then renders React. Real mode never starts MSW. This keeps the feature
and component layers independent of where data comes from.

The public build-time variables are:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL used by the shared HTTP client. |
| `VITE_USE_FIXTURES` | Explicit `true`/`false` switch for browser fixtures. |

Both variables are public. Missing URLs and values other than the literal
strings `true` or `false` fail during startup; there is no silent fallback.

## Source map

```text
src/
├── app/
│   ├── router.tsx                 Route definitions
│   └── routes/                    Page composition and route-level states
├── components/
│   ├── ui/                        shadcn/base UI primitives
│   └── evilcharts/                Recharts wrappers and chart primitives
├── config/env.ts                  Typed Vite environment configuration
├── features/
│   ├── auth/                      Auth transport types and API functions
│   ├── dashboard/                 Dashboard API, projection types, hook, UI
│   └── experiments/               Experiment resource transport types and API
├── hooks/                         Small cross-feature browser hooks
├── lib/
│   ├── http-client.ts             Framework-independent fetch boundary
│   └── utils.ts                   Shared class-name utilities
├── testing/
│   ├── fixtures/                  JSON resources and downloadable file bodies
│   ├── handlers/                  MSW handlers and dashboard projection
│   ├── browser.ts                 Browser worker creation
│   ├── handlers.ts                Handler composition
│   └── setup.ts                   Vitest browser shims
├── App.tsx                        Router provider root
├── index.css                      Global Tailwind/theme styles
└── main.tsx                       Runtime bootstrap
```

Routes live under `src/app/routes` and compose feature-owned UI. The current
routes are `/` (dashboard), `/experiments`, `/runs`, `/settings`, and a
not-found fallback. The latter three pages are intentionally placeholders.
Do not treat their copy as an implemented management workflow.

## Architecture rules

### Feature boundaries

Each feature owns its API declarations and transport types:

```text
src/features/<feature>/
├── api.ts
├── types.ts
├── components/       optional feature UI
└── ...
```

Feature API functions call `request` from `src/lib/http-client.ts`. They do not
import fixture JSON, import MSW, or branch on fixture mode. Components consume
feature APIs and props; they do not reconstruct backend joins from fixture
files.

The shared client resolves relative paths against `env.apiBaseUrl`, serializes
request bodies as JSON, preserves fetch options such as `AbortSignal`, parses
JSON or text responses, and throws `HttpError` for non-2xx responses. Keep it
framework-independent.

### UI composition

Routes own page composition. Feature hooks own coordinated state and data
loading. Extracted dashboard cards receive data and callbacks through props,
which keeps them testable and prevents chart concerns from leaking into
transport code. Reusable primitives belong in `components/ui`; local chart
wrappers belong in `components/evilcharts`.

### Adding UI

Use the existing shadcn configuration and the `@/` alias. New primitives can
be added with the configured shadcn registry, but keep feature-specific
configuration and behavior inside the owning feature. Avoid introducing a
global API barrel or a second transport abstraction without a clear need.

## Fixture and API contracts

MSW handlers are composed in `src/testing/handlers.ts` and organized by
transport concern:

- `auth.ts`: login, refresh, current-user, and roles responses.
- `dashboard.ts`: `POST /api/v1/dashboard` request validation and projection.
- `experiments.ts`: experiment, variant, run, measurement, comparison,
  artifact, and container-image collections/details.
- `artifacts.ts`: presigned URLs and deterministic fixture-storage downloads.

Current feature APIs use these provisional paths:

```text
/api/v1/auth/{login,refresh,me,roles}
/api/v1/dashboard
/api/v1/experiments
/api/v1/variants
/api/v1/runs
/api/v1/measurements
/api/v1/comparisons
/api/v1/artifacts
/api/v1/container-images
```

Collection responses use `{ "items": [...] }`; detail responses are resource
objects. Transport fields are camelCase, timestamps are ISO 8601 UTC strings,
and nullable values are explicit JSON `null`. Status, type, and format values
remain strings until the backend contract makes a closed enum appropriate.

The experiment fixtures form one canonical graph. Every variant resolves to an
experiment, every run to an experiment and input artifact, every measurement
to a run/variant and optional output artifact, and every comparison to one run
and its two measurements. Artifact metadata is in
`fixtures/experiments/artifacts.json`; `artifact-files.json` maps those IDs to
local bodies under `fixtures/files`. Use deterministic IDs and timestamps.
When changing a source file, regenerate its comparison diff rather than
editing the diff by hand. Failed and in-progress measurements intentionally
have no output body.

Auth fixtures model bearer-token transport and role-derived entitlements.
Permission strings use `resource:action` form. Keep `current-user.json`,
`roles.json`, and `token-response.json` internally consistent, and never add
credentials, password material, refresh tokens, signing keys, or production
URLs.

The SQL design is a domain reference, not a frontend schema. Do not copy
database-only identity, join-table, foreign-key, or persistence behavior into
UI types.

## Dashboard behavior

The dashboard sends `POST /api/v1/dashboard` for initial load and every filter
change. Requests include `filters` (`statuses`, `sources`, `experiments`) and
explicit `ordering`. `src/testing/handlers/dashboard-projection.ts` is the
fixture-side model of the response shape:

```text
response = { metadata, data }
data = { pieChart, sourceChart, runChart, experimentChart }
```

The filter rules are intentionally widget-specific:

| Selection | Projection behavior |
| --- | --- |
| Statuses | Pie counts ignore status selection. Source counts, incomplete counts, and run frequency use it. |
| Sources | Sources affect the projections where their data is selected; risk rows are source-filtered and line series use selected sources. |
| Experiments | Pie/source counts use selected experiments; run frequency also honors the aggregate-row rule in the projection. |
| Enable all | Selects all available values and resets the source carousel to page one. |
| Disable all | Clears all values, produces zero/empty projections, and resets the carousel. |

`metadata.hasSelection` is true only when at least one status, source, and
experiment are selected. Source rows retain known sources at zero count.
Experiment rows sort by incomplete percentage descending, incomplete count
descending, name ascending, then ID ascending. The source carousel shows four
cards on larger screens and two on small screens; navigation is separate from
selection and pointer swipes do not alter global selection.

Do not normalize these rules in a component or “simplify” them in the handler
without a product decision and corresponding tests. The projection tests are
the executable record of the current contract.

## Testing and validation

Vitest runs in jsdom with `src/testing/setup.ts`. Tests cover:

- dashboard projection calculations and ordering;
- dashboard MSW request validation and response shape;
- dashboard component interaction contracts.

Run the standard checks from the repository root:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

When changing a fixture graph, verify every reference and update projection
expectations. When changing an API shape, update the feature type, API
function, handler, fixture, and focused tests together. Keep the browser worker
boundary separate from Vitest’s Node `setupServer` usage.

## Deliberate scope

The current frontend does not implement a settings API, complete auth screens,
experiment/run management screens, persistence, or a backend. Do not add
fixture-mode branches to consumers to compensate. Add a typed feature boundary
and matching handler first, then build UI on that contract.
