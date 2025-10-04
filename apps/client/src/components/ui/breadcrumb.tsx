/**
 * @file This file defines a set of composable Breadcrumb components for navigation,
 * indicating the current page's location within a hierarchical structure.
 * @requires react
 * @requires @radix-ui/react-slot
 * @requires lucide-react
 * @requires @/lib/utils
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * The root container for the breadcrumb navigation.
 * @param {React.ComponentProps<"nav">} props - The component props.
 * @returns {JSX.Element} The rendered Breadcrumb component.
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

/**
 * An ordered list that contains the breadcrumb items.
 * @param {React.ComponentProps<"ol">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered BreadcrumbList component.
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * A single item within the breadcrumb list.
 * @param {React.ComponentProps<"li">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered BreadcrumbItem component.
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

/**
 * A link within a breadcrumb item. Can be rendered as a child component.
 * @param {React.ComponentProps<"a"> & { asChild?: boolean }} props - The component props.
 * @param {boolean} [props.asChild=false] - If true, renders as its child element.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered BreadcrumbLink component.
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

/**
 * The current page in the breadcrumb, which is not a link.
 * @param {React.ComponentProps<"span">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered BreadcrumbPage component.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

/**
 * The separator between breadcrumb items. Defaults to a chevron icon.
 * @param {React.ComponentProps<"li">} props - The component props.
 * @param {React.ReactNode} [props.children] - Custom separator element.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered BreadcrumbSeparator component.
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

/**
 * An ellipsis icon indicating that there are more breadcrumb items that are not visible.
 * @param {React.ComponentProps<"span">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered BreadcrumbEllipsis component.
 */
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
