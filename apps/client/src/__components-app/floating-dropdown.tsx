"use client"

import { AnimatePresence, motion } from "framer-motion"
import React from "react"

type DropdownMenuProps = {
  options: {
    label: string
    onClick: () => void
    Icon?: React.ReactNode
  }[]
  isOpen: boolean
  maxVisible?: number
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
  { options, isOpen, maxVisible = 5 },
  ref,
) {
  // Approximate item height ~48px (py-3 + text + gaps). Adjust if your item styling changes.
  const maxHeightPx = `${maxVisible * 48}px`

  return (
    <div className="relative" ref={ref}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.95, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
            className="absolute z-10 w-72 mt-2 p-2 blur-bg rounded-xl flex flex-col gap-2 overflow-y-auto overflow-x-hidden scroll-container no-scrollbar"
            style={{ maxHeight: maxHeightPx, overscrollBehavior: "contain" }}
          >
            {options && options.length > 0 ? (
              options.map((option, index) => (
                <motion.button
                  initial={{
                    opacity: 0,
                    x: 10,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    x: 10,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: "easeInOut",
                    type: "spring",
                  }}
                  whileHover={{
                    backgroundColor: "#11111140",
                    transition: {
                      duration: 0.1,
                      ease: "easeInOut",
                    },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                  }}
                  key={option.label}
                  onClick={option.onClick}
                  className="px-2 py-3 cursor-pointer text-white text-xs rounded-lg w-full text-left flex items-center gap-x-2 bg-transparent"
                >
                  {option.Icon}
                  {option.label}
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-2 text-white text-xs">No options</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Cross-browser scrollbar hiding */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and old Edge */
          scrollbar-width: none;    /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;            /* Chrome/Safari/Edge (WebKit/Blink) */
          width: 0;
          height: 0;
          background: transparent;
        }

        /* Keep supporting the original class used in the file */
        .scroll-container::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
          background: transparent;
        }
      `}</style>
    </div>
  )
})

export { DropdownMenu }
