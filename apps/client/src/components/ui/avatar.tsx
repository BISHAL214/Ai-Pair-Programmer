/**
 * @file This file defines a set of composable Avatar components for displaying user
 * profile pictures or initials. It is built on top of Radix UI's Avatar primitive.
 * @requires react
 * @requires @radix-ui/react-avatar
 * @requires @/lib/utils
 */
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * The root container for an avatar, which includes the image and a fallback.
 * @param {React.ComponentProps<typeof AvatarPrimitive.Root>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered Avatar component.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * The image part of the avatar. This will be displayed if the image loads successfully.
 * @param {React.ComponentProps<typeof AvatarPrimitive.Image>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AvatarImage component.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * A fallback that is displayed if the avatar image fails to load.
 * This can be used to show initials or a generic icon.
 * @param {React.ComponentProps<typeof AvatarPrimitive.Fallback>} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered AvatarFallback component.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
