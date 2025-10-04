/**
 * @file This file defines a reusable Button component for the application,
 * featuring various visual styles and sizes. It is built using `class-variance-authority`
 * for easy customization and polymorphism with Radix UI's Slot component.
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
 * Defines the different variants and sizes for the button component using `cva`.
 * This allows for a consistent and customizable button appearance throughout the application.
 * @property {object} variants - The different styles and sizes for the button.
 * @property {object} variants.variant - Defines the visual style of the button (e.g., default, destructive, outline).
 * @property {object} variants.size - Defines the size of the button (e.g., default, sm, lg).
 * @property {object} defaultVariants - The default variant and size to apply if not specified.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * A polymorphic button component that can be rendered as a standard HTML button
 * or as a child component, inheriting its properties.
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional CSS classes to apply to the button.
 * @param {"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"} [props.variant] - The visual style of the button.
 * @param {"default" | "sm" | "lg" | "icon"} [props.size] - The size of the button.
 * @param {boolean} [props.asChild=false] - If true, the component renders as its child element.
 * @param {React.ComponentProps<"button">} ...props - Other props are passed down to the underlying button element.
 * @returns {JSX.Element} The rendered Button component.
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
