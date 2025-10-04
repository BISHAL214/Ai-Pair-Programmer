/**
 * @file This file defines a responsive AspectRatio component.
 * It is a wrapper around Radix UI's AspectRatio primitive, used to maintain
 * the aspect ratio of an element as it scales.
 * @requires react
 * @requires @radix-ui/react-aspect-ratio
 */
"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * A component that constrains its children to a specific aspect ratio.
 * This is useful for embedding content like images or videos while maintaining their dimensions.
 * @param {React.ComponentProps<typeof AspectRatioPrimitive.Root>} props - The component props, inherited from Radix UI's AspectRatio.
 * @returns {JSX.Element} The rendered AspectRatio component.
 */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
