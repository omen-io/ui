# Omen

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MSW](https://img.shields.io/badge/MSW-3-FF6A33?logo=mockserviceworker&logoColor=white)](https://mswjs.io/)

Omen is an experiment-observability workspace for teams that need to compare
how different implementations behave on real workloads. It brings experiment
results, run health, measurements, and comparisons into one place so teams can
spot regressions and understand what changed.

The project is currently a frontend foundation: the dashboard is the primary
working experience, while the Experiments and Runs pages provide
fixture-backed list workflows and Settings remains a lightweight placeholder.
The UI can run
against deterministic local fixtures today and is shaped to connect to a Go
API later without changing feature consumers.

## What the product helps with

- See run outcomes and incomplete work at a glance.
- Compare run activity across experiment sources.
- Explore experiment risk and status trends through interactive dashboard
  cards and charts.
- Keep inputs, measurements, comparisons, and artifact downloads connected to
  the experiment that produced them.

Omen is designed for engineers and product teams who run controlled
experiments, benchmark alternative implementations, or need a shared view of
quality and operational risk.

## Run it locally

Requirements: a recent Node.js release and npm.

```bash
npm install
npm run dev
```

The development environment uses local MSW fixtures by default. Open the URL
printed by Vite to view the dashboard.

Useful commands:

```bash
npm run test       # run the test suite
npm run lint       # check source quality
npm run typecheck  # check TypeScript
npm run build      # create a production build
```

The public environment files select the data source:

- `.env.development` enables deterministic fixtures.
- `.env.production` points at the future API and disables fixtures.
- `.env.example` documents the two public Vite variables.

These values are build-time browser configuration. Never put passwords,
credentials, signing keys, or other secrets in them.

## Contributing

Contributions should preserve the product’s central promise: a clear,
trustworthy view of experiment behavior. A typical contribution looks like
this:

1. Choose a focused user or developer-facing improvement.
2. Keep feature code organized under its feature boundary.
3. Add or update tests for behavior and transport contracts.
4. Run the relevant checks (`test`, `lint`, `typecheck`, and `build`).
5. Describe the user-visible result and any fixture or API contract changes.

When adding an API-backed feature, keep its request/response types and request
functions together, use the shared transport boundary, and keep fixture data
consistent with the same resource relationships. The technical guide in
[`src/README.md`](src/README.md) is the source for architecture, fixture
rules, dashboard behavior, and testing conventions.

## Project status

The repository is intentionally evolving toward a complete experiment
workspace. The dashboard and its fixture-backed contracts are the most
developed area. Authentication and experiment resource APIs have transport
fixtures, but user-facing auth and resource management flows are not yet
complete. Backend behavior, persistence, and production deployment are
outside this frontend repository’s current scope.

## License

No license has been declared in this repository yet.
