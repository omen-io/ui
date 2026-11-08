# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Fixture data

The fixture set lives under `src/testing/fixtures` and is organized by API
feature:

- `auth` contains one current user, the two roles needed to derive its
  entitlements, and a deterministic bearer-token response.
- `experiments` is the canonical resource graph for experiments, variants,
  runs, measurements, comparisons, and metadata-only artifacts.
- `dashboard` contains one aggregate response for status/source distributions,
  daily trends, and ranked experiments. It currently includes five sources,
  including one complete experiment graph for each source.

Fixtures use deterministic UUIDs and ISO 8601 UTC timestamps. JSON uses
camelCase transport fields, collection responses use an `items` envelope, and
nullable API values are represented as `null`. References in the dashboard
projection point back to the canonical experiment graph; do not create a
second copy of those resources to feed a dashboard widget.

Each variant also includes its consumer-provided `key` and the exact
`callable` name exposed by the library. These values are data, not frontend
enums: preserve the callable spelling used by the consumer and do not infer
it from the display name.

Experiments also include a required `source` identifier supplied by the
service that created them (for example, `accounting-io-v1` or
`sales-worker-v3`). This identifies the experiment source for dashboard
grouping; variants can point to different container-image versions without
changing that experiment-level source. Image-backed variants use
`containerImageId`, which resolves to `experiments/container-images.json`.

Keep fixture records intentionally small for auth and resource screens. Add
dashboard records only when they exercise a distinct chart, summary, status,
relationship, or UI state. Never add passwords, password hashes, refresh
tokens, signing keys, credentials, file contents, or production artifact URLs.

The dashboard uses the status distribution and source distribution as global
filters. Selecting or clearing a status in the donut/legend or a source tile
updates the daily multi-series line chart and the experiment-risk table. The
risk table counts only selected non-completed statuses, so selecting only
`completed` intentionally produces an empty risk state. The dashboard fixture's
`runFrequency` rows should reconcile with `summary.totalRunCount` and the
per-source/status totals, while each `experimentRisk.statusCounts` record
provides the detail needed for filtered incomplete-run ranking. Experiments
are ordered by selected incomplete-run percentage, then incomplete count, then
stable experiment name/id tie-breakers.

Source cards are sorted by run count and displayed in a responsive carousel:
four cards per desktop page and two cards per smaller-screen page. Previous and
next controls are keyboard accessible, and horizontal pointer swipes move
between pages without changing the global source selection.

When a feature API is added, place its request and response types in
`src/features/<feature>/`, keep its JSON under the matching fixture directory,
and add the MSW handler at `src/testing/handlers/<feature>.ts`. Feature code
must call its `api.ts` module rather than importing fixture files directly.
Node/test MSW integration is intentionally deferred until a test runner is
introduced.

Fixture mode currently handles the complete transport surface represented by
these fixtures:

- `GET /api/v1/dashboard`
- `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET
  /api/v1/auth/me`, and `GET /api/v1/auth/roles`
- Experiment, variant, run, measurement, comparison, artifact, and
  container-image collection and detail endpoints under `/api/v1`
- Artifact presigned URLs and deterministic fixture-storage file downloads

The handlers live in `src/testing/handlers/<feature>.ts` and are composed by
`src/testing/handlers.ts`. They return the same JSON envelopes used by the
typed API modules under `src/features/<feature>/`; feature code should call
those API modules rather than importing fixture data. Missing resource IDs
return a JSON `404`, and unauthenticated current-user requests return `401`.
The settings screen has no fixture handler yet because no settings API
contract or fixture exists.

### SQL scaffold alignment

`db_example.sql` is a database reference, while fixtures model the HTTP
contract. SQL `snake_case` names are exposed as camelCase JSON, nullable SQL
columns remain JSON `null`, and database-only users, roles, permissions,
refresh-token, identity, and foreign-key mechanics are not fixture records.
The SQL `experiments.source`, `variants.container_image_id`, and
`container_images` tables are represented because they are useful resource
data. The SQL join-table foreign-key direction and generated identity details
are intentionally not copied into frontend types.

When changing the graph, every experiment source, variant image reference,
run input, measurement output, comparison measurement pair, and artifact file
mapping must resolve to an existing fixture record. Dashboard counts and
experiment projections must be updated from that same graph rather than
maintained as unrelated sample data.

### File fixtures and artifact downloads

The experiment artifact metadata and file bodies use the same deterministic
artifact IDs:

- `src/testing/fixtures/files/inputs` contains run inputs.
- `src/testing/fixtures/files/measurements` contains successful JSON and CSV
  measurement outputs.
- `src/testing/fixtures/files/comparisons` contains generated unified diffs for
  both JSON and CSV measurements.
- `src/testing/fixtures/experiments/artifact-files.json` is fixture-only
  infrastructure that maps each artifact ID to a local fixture path. It does
  not duplicate API metadata or storage implementation details.

The comparison fixture is generated from the control and candidate measurement
files with a standard unified-diff tool. JSON, CSV, and XML examples are
included. When either source file changes, regenerate the comparison instead of
editing the diff by hand. Failed and in-progress measurements intentionally do
not receive output bodies.

The canonical graph contains a complete successful run for each experiment.
Checkout ranking additionally contains a failed candidate measurement and an
in-progress candidate plus a successful retry to exercise lifecycle states.
The successful retry declares `retryOf` and has its own output artifact;
artifacts are not reused across runs unless that behavior is explicitly
modeled.

Feature code obtains a download URL through
`getArtifactDownloadUrl(artifactId)` and then fetches the returned URL. In
fixture mode, the artifact endpoint returns a deterministic
DigitalOcean Spaces/S3-shaped URL with `X-Amz-*` query parameters, and MSW
serves the matching fixture body from that URL. In real mode, the same API
function uses the Go API's actual presigned URL. No component or feature code
needs to branch on fixture mode.

Use `.env.development` for fixture mode and `.env.production` or an explicit
environment override for real mode. `VITE_API_BASE_URL` and
`VITE_USE_FIXTURES` are public build-time configuration; they must never
contain credentials or signing keys.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

### Dashboard chart components

The dashboard uses the local EvilCharts/Recharts wrappers for the interactive
status donut and source trend line. These wrappers follow the EvilCharts
gallery's composable chart pattern for legends, tooltips, and accessible
selection. Deselected status slices are dimmed through the pie component's
feature-level disabled-sector input. The trend chart uses an explicit
dashboard-owned high-contrast palette passed through `ChartConfig.colors`;
shadcn/EvilCharts default chart variables are intentionally not modified. If another chart is needed, prefer adding the corresponding
EvilCharts registry component with `npx shadcn@latest add
@evilcharts/recharts-<chart>` and keep its configuration in the feature rather
than importing fixture data into a component.
