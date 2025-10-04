/**
 * @file This file defines a reusable Input component for the application.
 * It provides a styled text input field with support for various states like focus, disabled, and invalid.
 * @requires react
 * @requires @/lib/utils
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A styled input component that wraps the standard HTML `<input>` element.
 * It includes styles for different states such as focus, disabled, and invalid,
 * and is built to be consistent with the application's design system.
 * @param {React.ComponentProps<"input">} props - The component props, which are the same as the standard HTML input attributes.
 * @param {string} [props.className] - Additional CSS classes to apply to the input.
 * @param {string} [props.type] - The type of the input (e.g., "text", "password", "email").
 * @returns {JSX.Element} The rendered Input component.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
