import { Combobox } from "@base-ui/react/combobox"
import { Check, ChevronDown, Loader2, Play, RotateCcw } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "@/components/ui/toast"
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNewRun } from "../hooks/use-new-run"

const formatSuggestions = ["json", "jsonl", "csv", "tsv", "txt", "xml", "yaml"]

export function NewRunForm() {
  const experimentInputId = useId()
  const formatInputId = useId()
  const [inputContent, setInputContent] = useState("")
  const [inputFormat, setInputFormat] = useState("json")
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    updateExperimentSearch,
    experiments,
    selectedExperiment,
    setSelectedExperiment,
    loadingExperiments,
    experimentsError,
  } = useNewRun()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedExperiment) {
      setValidationError("Choose an experiment before triggering a run.")
      return
    }

    if (!inputFormat.trim()) {
      setValidationError("Enter an input format before triggering a run.")
      return
    }

    setValidationError(null)
    toast.add({
      type: "success",
      title: "Run configured",
      description: `${selectedExperiment.name} is ready to run with ${inputFormat.trim()} input.`,
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="space-y-2">
        <div>
          <label className="text-sm font-medium" htmlFor={experimentInputId}>
            Experiment
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Search by experiment name and choose the implementation to run.
          </p>
        </div>
        <Combobox.Root
          items={experiments}
          value={selectedExperiment}
          onInputValueChange={(value) => {
            updateExperimentSearch(value)
            if (selectedExperiment && value !== selectedExperiment.name) {
              setSelectedExperiment(null)
            }
          }}
          onValueChange={(value) => setSelectedExperiment(value)}
          itemToStringLabel={(item) => item.name}
          isItemEqualToValue={(item, value) => item.id === value.id}
        >
          <Combobox.InputGroup className="relative">
            <Combobox.Input
              aria-label="Search experiments"
              className="h-9 w-full border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              id={experimentInputId}
              placeholder="Search experiments..."
            />
            <Combobox.Trigger
              aria-label="Show experiments"
              className="absolute top-0 right-0 flex h-9 w-9 items-center justify-center text-muted-foreground"
            >
              <ChevronDown className="size-4" />
            </Combobox.Trigger>
          </Combobox.InputGroup>
          <Combobox.Portal>
            <Combobox.Positioner className="z-50 outline-none" sideOffset={4}>
              <Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-border bg-popover text-popover-foreground shadow-md">
                <Combobox.Empty className="p-3 text-sm text-muted-foreground">
                  {loadingExperiments
                    ? "Loading experiments..."
                    : "No experiments found."}
                </Combobox.Empty>
                <Combobox.List className="max-h-60 overflow-y-auto p-1">
                  {(experiment: (typeof experiments)[number]) => (
                    <Combobox.Item
                      className="flex cursor-default items-center gap-2 px-2 py-2 text-sm outline-none data-highlighted:bg-muted"
                      key={experiment.id}
                      value={experiment}
                    >
                      <Combobox.ItemIndicator className="flex size-4 items-center justify-center">
                        <Check className="size-3.5" />
                      </Combobox.ItemIndicator>
                      <span className="min-w-0 flex-1 truncate">
                        {experiment.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {experiment.source}
                      </span>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        {experimentsError && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <RotateCcw className="size-3" />
            Experiments could not be loaded. Try refreshing the page.
          </p>
        )}
        {selectedExperiment && (
          <p className="font-mono text-[11px] text-muted-foreground">
            ID: {selectedExperiment.id}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <div>
          <label className="text-sm font-medium" htmlFor="run-input">
            Input
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Click into the editor to type or paste the content to provision.
          </p>
        </div>
        <CodeBlock>
          <CodeBlockHeader>
            <CodeBlockTitle>Input payload</CodeBlockTitle>
          </CodeBlockHeader>
          <textarea
            aria-label="Input payload"
            className="min-h-48 w-full resize-y bg-transparent px-3 py-3 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/50"
            id="run-input"
            onChange={(event) => setInputContent(event.target.value)}
            placeholder="Paste or type input content here..."
            value={inputContent}
          />
        </CodeBlock>
      </section>

      <section className="space-y-2">
        <div>
          <label className="text-sm font-medium" htmlFor={formatInputId}>
            Input format
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Use a common format or enter a custom format understood by the
            backend.
          </p>
        </div>
        <Input
          aria-label="Input format"
          autoComplete="off"
          id={formatInputId}
          list="run-input-formats"
          onChange={(event) => setInputFormat(event.target.value)}
          placeholder="e.g. json"
          value={inputFormat}
        />
        <datalist id="run-input-formats">
          {formatSuggestions.map((format) => (
            <option key={format} value={format} />
          ))}
        </datalist>
      </section>

      {validationError && (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      )}

      <div className="flex justify-end border-t pt-4">
        <Button disabled={loadingExperiments} type="submit">
          {loadingExperiments ? <Loader2 className="animate-spin" /> : <Play />}
          Trigger run
        </Button>
      </div>
    </form>
  )
}
