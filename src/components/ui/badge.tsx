import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)]",
        secondary:
          "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]",
        outline:
          "border border-[var(--border)] text-[var(--text-muted)]",
        success:
          "bg-[var(--status-success)]/15 text-[var(--status-success)]",
        warning:
          "bg-[var(--status-warning)]/15 text-[var(--status-warning)]",
        destructive:
          "bg-[var(--status-error)]/15 text-[var(--status-error)]",
        info:
          "bg-[var(--status-info)]/15 text-[var(--status-info)]",
        teal:
          "bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]",
        blue:
          "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]",
        beige:
          "bg-[var(--accent-beige)]/15 text-[var(--accent-beige)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
