import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { TaskStatus } from "@/features/tasks/types"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        [TaskStatus.TODO]:
          "border-transparent bg-red-400 text-primary hover:bg-red-400/80",
        [TaskStatus.IN_PROGRESS]:
          "border-transparent bg-yellow-400 text-primary hover:bg-yellow-400/80",
        [TaskStatus.IN_REVIEW]:
          "border-transparent bg-blue-400 text-primary hover:bg-blue-400/80",
        [TaskStatus.DONE]:
          "border-transparent bg-emerald-400 text-primary hover:bg-emerald-400/80",
        [TaskStatus.BACKLOG]:
          "border-transparent bg-pink-400 text-primary hover:bg-pink-400/80",
        // Dificultades
        Facil: "border-transparent bg-green-300 text-primary hover:bg-green-400/80",
        Medio: "border-transparent bg-orange-300 text-primary hover:bg-orange-400/80",
        Dificil: "border-transparent bg-red-600 text-primary hover:bg-red-700/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
