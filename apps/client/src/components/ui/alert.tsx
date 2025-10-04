/**
 * @file This file defines a set of composable Alert components for displaying
 * important messages. It includes variants for different alert types (e.g., default, destructive)
 * and is built using `class-variance-authority` for easy styling.
 * @requires react
 * @requires class-variance-authority
 * @requires @/lib/utils
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Defines the different variants for the alert component using `cva`.
 * @property {object} variants - The different styles for the alert.
 * @property {object} variants.variant - Defines the visual style of the alert (e.g., default, destructive).
 * @property {object} defaultVariants - The default variant to apply if not specified.
 */
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * The main container for an alert message.
 * @param {React.ComponentProps<"div"> & VariantProps<typeof alertVariants>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {"default" | "destructive"} [props.variant] - The variant of the alert.
 * @returns {JSX.Element} The rendered Alert component.
 */
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * The title of the alert, which should be a short, descriptive message.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertTitle component.
 */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

/**
 * The description of the alert, providing more detailed information.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDescription component.
 */
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
