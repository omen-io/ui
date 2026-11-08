import { authHandlers } from "./handlers/auth"
import { artifactHandlers } from "./handlers/artifacts"
import { dashboardHandlers } from "./handlers/dashboard"
import { experimentHandlers } from "./handlers/experiments"

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...experimentHandlers,
  ...artifactHandlers,
]
