import { Link } from "react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export function ExperimentsHeader() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Experiments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Experiment workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Experiments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with an experiment, then follow its runs, measurements, and comparisons.
          </p>
        </div>
      </header>
    </>
  )
}
