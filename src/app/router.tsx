import { createBrowserRouter } from "react-router"
import AppLayout from "@/app/routes/app-layout"
import DashboardRoute from "@/app/routes/dashboard"
import NotFoundPage from "@/app/routes/errors/not-found.tsx"
import SettingsPage from "@/app/routes/settings"
import ExperimentsPage from "@/app/routes/experiments"
import NewRunPage from "@/app/routes/runs/new"
import RunsPage from "@/app/routes/runs"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardRoute },
      { path: "settings", Component: SettingsPage },
      { path: "experiments", Component: ExperimentsPage },
      { path: "runs", Component: RunsPage },
      { path: "runs/new", Component: NewRunPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
])