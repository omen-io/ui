import { RouterProvider } from "react-router/dom"
import { router } from "@/app/router"
import { Toaster } from "@/components/ui/toast"

export default function App() {
  return (
    <Toaster>
      <RouterProvider router={router} />
    </Toaster>
  )
}
