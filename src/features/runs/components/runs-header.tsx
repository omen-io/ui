import { Link } from "react-router"
import { Play } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

export function RunsHeader() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Runs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Experiment workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Runs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review every execution and follow its experiment results.
          </p>
        </div>
        <Button render={<Link to="/runs/new" />}>
          <Play />
          Run
        </Button>
      </header>
    </>
  )
}
