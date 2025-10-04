/**
 * @file This file defines a set of accessible and customizable AlertDialog components.
 * It is built on top of Radix UI's AlertDialog primitive and is styled with Tailwind CSS,
 * providing a modal dialog to interrupt the user with important information.
 * @requires react
 * @requires @radix-ui/react-alert-dialog
 * @requires @/lib/utils
 * @requires @/components/ui/button
 */
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * The root component for an alert dialog, which contains all other parts of the dialog.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Root>} props - The component props.
 * @returns {JSX.Element} The rendered AlertDialog root component.
 */
function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

/**
 * A button or link that triggers the opening of the alert dialog.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Trigger>} props - The component props.
 * @returns {JSX.Element} The rendered AlertDialogTrigger component.
 */
function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

/**
 * A portal that renders the alert dialog's content in a separate DOM tree,
 * typically at the end of the document body.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Portal>} props - The component props.
 * @returns {JSX.Element} The rendered AlertDialogPortal component.
 */
function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

/**
 * A semi-transparent overlay that covers the main content when the alert dialog is open.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Overlay>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogOverlay component.
 */
function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * The main content container for the alert dialog.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Content>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogContent component.
 */
function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

/**
 * The header section of the alert dialog, typically containing the title and description.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogHeader component.
 */
function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

/**
 * The footer section of the alert dialog, typically containing action and cancel buttons.
 * @param {React.ComponentProps<"div">} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogFooter component.
 */
function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * The title of the alert dialog.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Title>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogTitle component.
 */
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

/**
 * The description of the alert dialog, providing more details about the alert.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Description>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogDescription component.
 */
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * The action button for the alert dialog, typically used for confirming an action.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Action>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogAction component.
 */
function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

/**
 * The cancel button for the alert dialog, used for dismissing the dialog.
 * @param {React.ComponentProps<typeof AlertDialogPrimitive.Cancel>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AlertDialogCancel component.
 */
function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
