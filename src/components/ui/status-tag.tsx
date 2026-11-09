import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export const STATUS_VALUES = [
  "completed",
  "in_progress",
  "completed_with_differences",
  "failed",
] as const

export type Status = (typeof STATUS_VALUES)[number]

export const STATUS_TAGS: Record<Status, { label: string; color: string }> = {
  completed: { label: "COMP", color: "var(--status-completed)" },
  completed_with_differences: {
    label: "DIFF",
    color: "var(--status-differences)",
  },
  in_progress: { label: "PEND", color: "var(--status-pending)" },
  failed: { label: "FAIL", color: "var(--status-failed)" },
}

export const isStatus = (value: string): value is Status =>
  STATUS_VALUES.includes(value as Status)

const formatUnknownStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())

type StatusTagProps = {
  status: string
  className?: string
  suffix?: ReactNode
}

export function StatusTag({ status, className, suffix }: StatusTagProps) {
  const tag = isStatus(status) ? STATUS_TAGS[status] : null

  return (
    <Badge
      className={cn("w-fit", className)}
      style={
        tag
          ? {
              borderColor: `color-mix(in srgb, ${tag.color} 30%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${tag.color} 12%, transparent)`,
              color: tag.color,
            }
          : undefined
      }
      variant={tag ? "outline" : "secondary"}
    >
      <span className="inline-flex w-12 shrink-0 justify-center">
        {tag?.label ?? formatUnknownStatus(status)}
      </span>
      {suffix !== undefined && <span className="min-w-0 flex-1">{suffix}</span>}
    </Badge>
  )
}
