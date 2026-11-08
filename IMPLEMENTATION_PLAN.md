# Fixture-backed API foundation

## Objective

Prepare this Vite/React application to run against JSON fixtures now and a future Go/PostgreSQL backend later, without changing feature consumers when the backend becomes available.

The application must use the same HTTP-shaped request path in both modes:

```text
feature API function -> shared HTTP client -> browser fetch
                                             |
                           fixture mode: MSW intercepts fetch
                           real mode: request reaches Go API
```

## Repository context

- Stack: React 19, TypeScript, Vite 8, React Router.
- Existing structure includes `src/app`, `src/components`, `src/hooks`, and `src/lib`.
- `src/features`, `src/config`, and `src/testing` do not yet exist.
- There is no API client, MSW setup, test runner, or server-state library.
- Existing `experiments` and `measurements` routes are placeholder screens and must remain unchanged in this task.
- The working tree contains unrelated in-progress changes. Do not revert, reformat, or modify unrelated files.

## SQL-derived fixture scope

`db_example.sql` is a domain reference, not a finalized API contract. Use it to make fixture data internally consistent, but do not expose database-only fields or encode its unresolved constraints in UI code.

Do not reproduce the SQL DDL, identity/default behavior, or `ALTER TABLE` directionality in fixture code. In particular, treat relationship integrity as a fixture-data requirement only; final PostgreSQL foreign keys, delete behavior, indexes, and naming remain backend decisions.

### Fixture domains

Keep fixture files grouped by feature and keep the JSON response shape close to the future resource returned by Go:

```text
src/testing/
├── fixtures/
│   ├── auth/
│   │   ├── current-user.json
│   │   ├── roles.json
│   │   └── token-response.json
│   ├── experiments/
│   │   ├── experiments.json
│   │   ├── variants.json
│   │   ├── runs.json
│   │   ├── measurements.json
│   │   ├── comparisons.json
│   │   └── artifacts.json
│   └── ...
└── handlers/
    ├── auth.ts
    └── experiments.ts
```

The minimum fixture graph for the first implementation should contain:

- `experiments`: `id`, `name`, `createdAt`, `updatedAt`; include at least two records.
- `variants`: `id`, `experimentId`, `type`, `key`, `callable`, `name`; `key` is the consumer-provided identifier and `callable` is the actual function or method name that triggers the variant behavior. Include a control and candidate variant for one experiment.
- `runs`: `id`, `experimentId`, `inputFileId`, `inputFormat`, `status`, nullable `startedAt`/`endedAt`, `createdAt`, `updatedAt`; include one completed run and one in-progress run.
- `measurements`: `id`, `runId`, `variantId`, nullable `outputFileId`, `outputFormat`, `status`, nullable `error`, `startedAt`, nullable `endedAt`, `createdAt`, `updatedAt`; include successful and failed status examples.
- `comparisons`: `id`, `runId`, `controlMeasurementId`, `candidateMeasurementId`, nullable `outputFileId`, `outputFormat`, `createdAt`, `updatedAt`; include one comparison whose measurements belong to the same run.
- `artifacts`: `id`, `bucket`, `objectKey`, `filename`, `contentType`, `createdAt`; use safe local fixture values and never include file contents or credentials.

Use deterministic UUID strings and ISO 8601 UTC timestamps in every fixture so relationships and snapshots remain stable. Every foreign-key-like reference must resolve within the fixture set: variant → experiment, run → experiment/artifact, measurement → run/variant/artifact, and comparison → run/measurements/artifact. Prefer response fields in camelCase (`experimentId`, `createdAt`) even though the draft SQL uses snake_case; the future Go API can own the database-to-JSON mapping.

Auth uses JWT bearer tokens. If an auth API is needed, add a `token-response.json` fixture that matches the future Go response shape, for example:

```json
{
  "accessToken": "<fixture-jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

The fixture JWT payload should model the claims the frontend depends on, without pretending to define the final backend contract:

```json
{
  "sub": "00000000-0000-0000-0000-000000000001",
  "iss": "omen-api",
  "aud": "omen-ui",
  "iat": 1893456000,
  "exp": 1893459600,
  "entitlements": [
    "dashboard:read",
    "experiments:read",
    "settings:write"
  ]
}
```

Use a deterministic, fixture-only JWT value or a clearly marked test token. Never commit production signing keys, passwords, password hashes, token hashes, refresh tokens, or credentials. The frontend must send the returned token as `Authorization: Bearer <accessToken>` through the shared HTTP client; it must not rely on fixture-only token shortcuts. Backend signature verification, expiry policy, refresh-token rotation, issuer/audience validation, and exact claim naming remain Go/API decisions.

Entitlements are the union of permissions granted by every role assigned to the user. For example, an admin fixture should contain all permissions represented by its roles, while a regular user should contain only the union of its assigned role permissions. Permission strings use the `resource:action` format, such as `dashboard:read`, `experiments:read`, and `settings:write`; treat them as strings rather than a frontend enum until the backend contract is finalized. Keep `current-user.json` and `roles.json` consistent with the JWT payload when both are present. The draft `users_roles` and `roles_permissions` tables should be represented as nested response data or separate lookup responses, not as UI-facing join-table records unless a future endpoint explicitly requires them.

### Provisional response and handler rules

- Use resource collections such as `{ "items": [...] }` for list responses and a single resource object for detail responses; keep this envelope consistent across handlers.
- Treat `status`, `type`, `inputFormat`, and `outputFormat` as strings in fixtures. Do not create a frontend enum that claims the allowed values until the backend contract is finalized.
- Preserve nullable SQL values as JSON `null`, not empty strings or omitted fields.
- Keep timestamps as strings at the transport boundary; parse them only in feature code that needs date behavior.
- Start with provisional paths such as `/api/v1/experiments`, `/api/v1/variants`, `/api/v1/runs`, `/api/v1/measurements`, `/api/v1/comparisons`, and `/api/v1/artifacts`. Centralize these paths in feature `api.ts` modules so they can change with the Go API.
- If auth is implemented, use provisional `/api/v1/auth/login`, `/api/v1/auth/refresh`, and `/api/v1/auth/me` paths, with the token response and bearer behavior centralized in the auth API module.
- Do not infer pagination, filtering, sorting, authentication, upload/download behavior, or artifact content URLs from the SQL file. Add them only when an API contract defines them.

## Required architecture

### Runtime modes

Use Vite environment variables, parsed once by a typed configuration module:

- `VITE_API_BASE_URL`: base URL for the future Go API.
- `VITE_USE_FIXTURES`: explicit boolean switch for fixture mode.

Recommended environment files:

- `.env.development`: fixture mode enabled and a local API base URL.
- `.env.production`: fixture mode disabled and the deployed API base URL.
- `.env.example`: documented variable names and safe placeholder values only.

Rules:

1. Only variables prefixed with `VITE_` may be read from browser code.
2. Parse booleans explicitly; do not use truthiness (`Boolean(value)`).
3. Missing or invalid required values must throw an actionable configuration error during startup.
4. Do not silently fall back to fixtures or the real API.
5. Never put credentials or secrets in Vite environment variables; browser-exposed variables are public.

### Shared HTTP client

Create a framework-independent request helper under `src/lib`:

- Resolve relative paths against `VITE_API_BASE_URL`.
- Use `fetch`.
- Set JSON request headers only when a request has a body.
- Parse successful JSON responses.
- Throw a typed, useful error for non-2xx responses, including status and response details when available.
- Preserve `AbortSignal` support.
- Do not import MSW, React, feature modules, or fixture data.

The helper is the only shared transport abstraction required for this foundation. Do not add Axios unless an existing requirement appears that `fetch` cannot satisfy.

### Feature API boundary

Follow the Bulletproof React feature layout:

```text
src/features/{feature}/
├── api.ts       # request declarations/functions consumed by the feature
├── types.ts     # feature request/response types
├── components/  # only when feature UI is added later
└── ...
```

Feature API functions must:

- Declare endpoint paths, methods, request parameters, and response types.
- Call the shared HTTP client.
- Never import JSON fixtures or branch on fixture mode.
- Be imported directly rather than through a feature-wide barrel file.

### MSW browser integration

Add MSW as a development dependency and create browser-only setup under `src/testing` (or the closest existing shared testing boundary):

- `browser.ts`: create the MSW service worker.
- `handlers.ts`: compose feature handlers.
- `handlers/{feature}.ts`: feature-scoped request handlers and fixture responses.
- `fixtures/{feature}/*.json`: valid JSON fixture payloads aligned with future backend response shapes.

Startup requirements:

1. In fixture mode, start the worker before rendering React.
2. In real mode, do not import or start the worker.
3. Use a dynamic import for the fixture-only bootstrap so production does not eagerly include MSW startup code.
4. Fail startup if MSW cannot initialize in fixture mode; do not render a success-shaped app that silently falls through to the network.
5. Configure unhandled-request behavior so missing handlers are visible during development rather than silently masking an incomplete fixture setup.
6. Do not require a mock server, MSW CLI process, or special production deployment.

Handlers must model HTTP behavior, not bypass it. They should use the same URL paths and response envelopes that `src/features/{feature}/api.ts` expects from the Go backend.

For the SQL-derived experiment graph, keep request declarations and handlers feature-scoped even if several resources share one domain:

- `src/features/experiments/api.ts` and `types.ts` own experiment, variant, run, measurement, comparison, and artifact transport types.
- `src/testing/handlers/experiments.ts` maps the provisional paths to the corresponding JSON fixtures and returns only the response shape declared by `api.ts`.
- A handler may compose related fixture records for a detail response, but must not mutate fixture imports or make components reconstruct database joins.
- If separate feature boundaries are introduced later, move the resource API/types and handler together; do not create a global fixture registry.

### Scope boundary

Do not:

- Wire `experiments` or `measurements` pages.
- Add feature-specific UI, hooks, stores, or route changes.
- Add TanStack Query in this task.
- Add MSW Node/test integration before a test runner exists.
- Move all API calls into a global API folder; keep feature request declarations in feature folders.
- Create direct `fixtureMode ? fixture : fetch` branches in components or feature API modules.

## Ordered implementation steps

1. **Inspect and preserve the worktree**
   - Review current `git status`.
   - Do not overwrite or revert unrelated pending changes.

2. **Add dependencies and configuration**
   - Add `msw` as a development dependency.
   - Add `src/config/env.ts` or equivalent typed config module.
   - Add `.env.example` and mode-specific example configuration if consistent with repository conventions.
   - Keep all public values non-secret.

3. **Implement the shared HTTP client**
   - Add typed request/response/error handling under `src/lib`.
   - Keep it independent of MSW and React.

4. **Create the MSW browser bootstrap**
   - Add browser worker creation and handler composition.
   - Add the fixture-only startup path before `createRoot`.
   - Ensure real mode renders without loading or starting MSW.

5. **Create the feature contract pattern**
   - Add a minimal representative experiments API/type module only if needed to demonstrate the convention, using the SQL-derived resource graph as provisional input.
   - Add deterministic JSON fixtures for experiments, variants, runs, measurements, comparisons, and artifacts, with the referentially consistent seed graph defined above.
   - Add matching handlers for the smallest useful collection/detail requests; do not wire the existing placeholder screens in this task.
   - Keep provisional endpoint paths and response envelopes centralized and clearly labeled so the Go API can replace them without changing consumers.
   - If auth is needed, add JWT token fixtures with deterministic claims and role-permission entitlement unions; do not add real signing material.

6. **Document contributor workflow**
   - Explain how to run fixture mode.
   - Explain how to run against the future Go API.
   - Explain how to add a feature API, fixture, and handler.
   - Explain the SQL-derived fixture graph, deterministic IDs, ISO timestamps, nullable values, and relationship integrity.
   - Explain the JWT fixture response, bearer-token transport, standard claims, and entitlement union across roles.
   - State that feature code always calls `api.ts` and never imports fixtures.
   - State that `.env` values are build-time public configuration.
   - Document that Node/test MSW integration is intentionally deferred.

7. **Validate**
   - Run `npm run typecheck`.
   - Run `npm run lint`.
   - Run `npm run build`.
   - Start fixture mode and verify the worker starts before React and fixture requests resolve.
   - Start real mode and verify MSW is not started and requests target `VITE_API_BASE_URL`.
   - Confirm existing routes still render and unrelated pending changes remain intact.

## Acceptance criteria

- A new contributor can select fixture or real mode using documented Vite environment configuration without changing TypeScript source.
- Missing or invalid configuration fails with a clear message.
- Feature request code lives in `src/features/{feature}/api.ts` and calls the shared HTTP client.
- Fixture mode intercepts the same browser HTTP requests that real mode would send.
- Fixtures are JSON and are not imported by UI components or feature API modules.
- The initial experiment fixture graph contains valid relationships across experiments, variants, runs, measurements, comparisons, and artifacts, including nullable fields and representative statuses.
- Fixture transport uses deterministic IDs and ISO 8601 UTC timestamps, with no passwords, password hashes, refresh tokens, signing keys, credentials, or other production secrets.
- When auth is included, JWT fixtures contain a bearer token response and entitlement claims using `resource:action` permission strings; entitlements equal the union of permissions from all assigned roles.
- Production/real mode does not start MSW and does not require a mock server.
- No current route behavior is changed.
- Typecheck, lint, and build pass.
- The implementation leaves a clear path to add MSW Node/test integration later without changing handlers.

## Research references

- Bulletproof React project structure:
  <https://raw.githubusercontent.com/alan2207/bulletproof-react/master/docs/project-structure.md>
- MSW browser integration:
  <https://mswjs.io/guides/integrations/browser>
- Vite environment variables and modes:
  <https://vite.dev/guide/env-and-mode>
- TanStack Query server-state rationale for a future task:
  <https://tanstack.com/query/latest/docs/framework/react/overview>
