# Future experiments graph pages

## Product intent

The experiments workspace should let a user move from a high-level catalog to
the evidence behind a result without losing context. Each page should preserve
the graph position in the URL and breadcrumbs:

```text
Experiments → Experiment → Run → Measurement → Comparison
```

Every page should keep the parent resource available as a navigation target,
show the current resource as the final breadcrumb, and expose only actions
that are valid for that resource's state.

## Experiment detail

**Route:** `/experiments/:experimentId`

**Primary question:** What is this experiment, and which runs should I inspect?

**Suggested content:**

- Header with experiment name, source, ID copy action, and created/updated
  timestamps.
- Summary cards for total runs, completed/failed/in-progress runs, variants,
  and latest activity.
- Run list with run id, status, started at and ended at; with a limit of 5 runs.
- See all runs link at the very end of the run list that will redirect to the runs view with the appropriate experiment
  filters to match only the runs of the current experiment detail.
- Empty, loading, not-found, and transport-error states.

**Navigation:** selecting a run goes to `/experiments/:experimentId/runs/:runId`.

## Run detail

**Route:** `/experiments/:experimentId/runs/:runId`

**Primary question:** What happened during this execution?

**Suggested content:**

- Run status banner, lifecycle timestamps, duration, input artifact metadata,
  input artifact preview, and a stable run ID.
- Measurement table with id, variant, status, lifecycle timestamps and duration.
- A clear distinction between in-progress, completed with differences, failed, and completed
  measurements.
- Retry or refresh affordances only when the backend contract supports them.
- Links from each measurement to its detail page and back to the run.

**Navigation:** selecting a measurement goes to
`/experiments/:experimentId/runs/:runId/measurements/:measurementId`.

## Measurement detail

**Route:** `/experiments/:experimentId/runs/:runId/measurements/:measurementId`

**Primary question:** What did this variant produce, and can I compare it?

**Suggested content:**

- Variant identity and callable/container image context.
- Measurement status, timestamps, duration, output format, artifact metadata,
  and a readable error panel when applicable.
- Output preview for supported text formats, with download for all artifacts.
- Links to comparisons that use this measurement.
- Explicit unavailable states for failed measurements with no output artifact.

**Navigation:** a comparison action should select the measurement as either
control or candidate and route to the comparison detail.

## Comparison detail

**Route:** `/experiments/:experimentId/runs/:runId/comparisons/:comparisonId`

**Primary question:** What changed between the two measurements?

**Suggested content:**

- Control/candidate identity, variant names, statuses, and artifact formats.

Run and measurement status tags use the shared standard: `completed` renders as
`COMP` in green, `completed_with_differences` as `DIFF` in orange,
`in_progress` as `PEND` in yellow, and `failed` as `FAIL` in red.

- Diff viewer with syntax-aware rendering where possible and a plain-text
  fallback for unsupported formats.
- Summary metrics for additions, removals, changed values, and domain-specific
  regression indicators when the backend provides them.
- Download action for the generated comparison artifact.
- Clear handling for missing artifacts, expired downloads, and incomplete
  comparisons.

## Manual run page

**Route:** `/runs/new`

**Primary question:** Which experiment should I run, and what input should it
process?

**Suggested content:**

- Experiment selector showing the experiment name, source, and enough context
  to choose the correct implementation.
- Input content editor for manually provided experiment data.
- Input format selector with the formats supported by the selected experiment.
- Clear validation for a missing experiment, empty input, and unsupported
  format.
- Submit action that starts the run and provides loading, success, and
  transport-error states.
- A concise summary of the selected experiment and submitted input before
  starting the run.

**Navigation:** after a successful submission, route to the created run at
`/experiments/:experimentId/runs/:runId`; provide a link back to `/runs` when
the user cancels or finishes.

## Cross-page implementation rules

1. Keep all resource queries, filter parameters, and response types inside the
   experiments feature API boundary.
2. Keep business logic, joins, ordering, and pagination in the backend; the UI
   should render projections and coordinate state.
3. Use route loaders or feature hooks consistently, with abortable requests and
   explicit loading/error/not-found states.
4. Preserve the canonical fixture graph and nullable artifact semantics in MSW
   tests before adding richer UI states.
5. Test breadcrumb URLs, parent-child navigation, query serialization, and
   empty/error behavior at each level.
