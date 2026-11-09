import { Link } from "react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NewRunForm } from "@/features/runs/components/new-run-form"

export default function NewRunPage() {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-background p-4 text-foreground sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/runs" />}>Runs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Experiment workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Run an experiment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the experiment, input, and format for a new run.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Run configuration</CardTitle>
            <CardDescription>
              The run will be simulated until the backend creation API is
              available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewRunForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
