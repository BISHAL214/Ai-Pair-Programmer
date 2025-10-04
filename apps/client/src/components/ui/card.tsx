/**
 * @file This file defines a set of composable Card components.
 * These components are used to display content in a structured and visually
 * appealing card format, including a header, title, description, content area, and footer.
 * @requires react
 * @requires @/lib/utils
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The main container for a card. It provides the basic structure and styling.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered Card component.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * The header section of a card. It typically contains the title and description.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered CardHeader component.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * The title of a card, intended to be used within a `CardHeader`.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered CardTitle component.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * The description of a card, intended to be used within a `CardHeader`.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered CardDescription component.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * A container for action elements (e.g., buttons, menus) within the `CardHeader`.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered CardAction component.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * The main content area of a card.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered CardContent component.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * The footer section of a card.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered CardFooter component.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
