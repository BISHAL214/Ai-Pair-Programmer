/**
 * @file This file defines a reusable Badge component for displaying status indicators,
 * tags, or categories. It uses `class-variance-authority` for different visual styles.
 * @requires react
 * @requires @radix-ui/react-slot
 * @requires class-variance-authority
 * @requires @/lib/utils
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Defines the different variants for the badge component using `cva`.
 * @property {object} variants - The different styles for the badge.
 * @property {object} variants.variant - Defines the visual style (e.g., default, secondary, destructive, outline).
 * @property {object} defaultVariants - The default variant to apply if not specified.
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * A polymorphic badge component that can be rendered as a `<span>` or as its child element.
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {"default" | "secondary" | "destructive" | "outline"} [props.variant] - The visual style of the badge.
 * @param {boolean} [props.asChild=false] - If true, renders as its child element.
 * @param {React.ComponentProps<"span">} ...props - Other props are passed down to the underlying element.
 * @returns {JSX.Element} The rendered Badge component.
 */
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
