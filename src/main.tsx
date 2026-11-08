import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { env } from "@/config/env"

const bootstrap = async () => {
  if (env.useFixtures) {
    const { worker } = await import("@/testing/browser")
    await worker.start()
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
}

void bootstrap()
