import { createBrowserRouter } from "react-router"
import AppLayout from "@/app/routes/app-layout"
import DashboardRoute from "@/app/routes/dashboard"
import NotFoundPage from "@/app/routes/errors/not-found.tsx"
import ExperimentsPage from "@/app/routes/experiments"
import ExperimentDetailPage from "@/app/routes/experiments/detail"
import RunDetailPage from "@/app/routes/runs/detail"
import MeasurementDetailPage from "@/app/routes/experiments/measurement-detail"
import ArtifactDetailPage from "@/app/routes/artifacts/detail"
import NewRunPage from "@/app/routes/runs/new"
import RunsPage from "@/app/routes/runs"
import ComparisonAnalyzerPage from "@/app/routes/comparisons"
import ProfilePage from "@/app/routes/profile"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardRoute },
      { path: "experiments", Component: ExperimentsPage },
      { path: "experiments/:experimentId", Component: ExperimentDetailPage },
      { path: "runs", Component: RunsPage },
      {
        path: "experiments/:experimentId/runs/:runId",
        Component: RunDetailPage,
      },
      {
        path: "experiments/:experimentId/runs/:runId/measurements/:measurementId",
        Component: MeasurementDetailPage,
      },
      { path: "artifacts/:artifactId", Component: ArtifactDetailPage },
      { path: "comparisons/:comparisonId", Component: ComparisonAnalyzerPage },
      { path: "runs/new", Component: NewRunPage },
      { path: "profile", Component: ProfilePage },
      { path: "*", Component: NotFoundPage },
    ],
  },
])
