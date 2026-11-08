import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewRunPage() {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <Button render={<Link to="/runs" />} variant="ghost">
          <ArrowLeft />
          Back to runs
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Run an experiment</h1>
          <p className="mt-2 text-muted-foreground">
            Experiment selection and input configuration will be available here.
          </p>
        </div>
      </div>
    </main>
  )
}
