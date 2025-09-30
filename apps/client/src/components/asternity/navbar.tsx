"use client";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/themes/theme-toggler";
import type { User } from "@supabase/supabase-js";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";

import { BorderBeam } from "@/__components-app/border-trail";
import { Menu, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div
      ref={ref}
      className={cn(
        // switched to fixed to avoid space pushing
        "fixed top-2 inset-x-0 z-50 w-full",
        className
      )}
      style={{ margin: 0, padding: 0, lineHeight: 0 }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex backdrop-blur-md bg-white/70 dark:bg-neutral-950/70",
        visible && "backdrop-blur-xl bg-white/80 dark:bg-neutral-950/80",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-800"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between px-0 py-2 lg:hidden backdrop-blur-md bg-white/70 dark:bg-neutral-950/70",
        visible && "backdrop-blur-xl bg-white/80 dark:bg-neutral-950/80",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <img
        src="https://assets.aceternity.com/logo-dark.png"
        alt="logo"
        width={30}
        height={30}
      />
      <span className="font-medium text-black dark:text-white">AIPP</span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

// export const NavigationBar = ({
//   user,
//   handleLogout,
// }: {
//   user: User | null;
//   handleLogout: () => void;
// }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);

//   const navItems = [
//     { name: "Home", link: "/" },
//     { name: "Features", link: "/features" },
//     { name: "Pricing", link: "/pricing" },
//     { name: "About", link: "/about" },
//   ];

//   return (
//     <Navbar>
//       <NavBody className="flex items-center justify-between">
//         <NavbarLogo />
//         <NavItems items={navItems} />
//         <div className="flex items-center space-x-2">
//           <AnimatedThemeToggler className="z-50" />
//           {/* <NavbarButton>
//             <ThemeSelector colorThemes={["default", "supabase", "mono"]} />
//           </NavbarButton> */}
//           {user ? (
//             <div className="flex items-center gap-2">
//               <NavbarButton onClick={handleLogout} variant="secondary">
//                 Logout
//               </NavbarButton>
//               <Avatar>
//                 <AvatarImage
//                   src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
//                   alt="User Avatar"
//                 />
//               </Avatar>
//             </div>
//           ) : (
//             <NavbarButton href="/auth" variant="gradient">
//               Login
//             </NavbarButton>
//           )}
//         </div>
//       </NavBody>

//       <MobileNav>
//         <MobileNavHeader>
//           <NavbarLogo />
//           <MobileNavToggle
//             isOpen={isMobileMenuOpen}
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           />
//         </MobileNavHeader>
//         <MobileNavMenu
//           isOpen={isMobileMenuOpen}
//           onClose={() => setIsMobileMenuOpen(false)}
//         >
//           <NavItems
//             items={navItems}
//             onItemClick={() => setIsMobileMenuOpen(false)}
//           />
//           <NavbarButton
//             href="/get-started"
//             variant="gradient"
//             className="w-full text-center"
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             Get Started
//           </NavbarButton>
//         </MobileNavMenu>
//       </MobileNav>
//     </Navbar>
//   );
// };

// "use client"

// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { Menu, X } from "lucide-react"
// import { Button } from "@/components/ui/button"

// const navItems = [
//   { name: "Home", href: "#home" },
//   { name: "Features", href: "#features" },
//   { name: "Pricing", href: "#pricing" },
//   { name: "About", href: "#about" },
// ]

export function NavigationBar({
  user,
  handleLogout,
}: {
  user: User | null;
  handleLogout: () => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Features", link: "/features" },
    { name: "Pricing", link: "/pricing" },
    { name: "About", link: "/about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden rounded-full md:block transition-all duration-300 ${
          isScrolled ? "w-[600px]" : "w-[900px]"
        }`}
      >
        <BorderBeam
          className="bg-linear-to-r dark:from-[#5C4F9C] dark:to-[#DAACC4]"
          initialOffset={0} // 👈 start at beginning
        />

        <div className="backdrop-blur-md bg-white/10 dark:bg-white/10 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div> */}
              <Image
                src={"/logo.jpeg"}
                alt="logo"
                width={30}
                height={30}
                className="rounded-full object-cover"
              />
              <span className="font-bold text-white font-mono">AIPP</span>
            </div>
            <NavItems items={navItems} />

            <div className="flex justify-between items-center gap-4">
              <AnimatedThemeToggler className="z-50" />

              {user ? (
                <React.Fragment>
                  <Avatar>
                    <AvatarImage
                      src={
                        user?.user_metadata?.avatar_url || "/placeholder.svg"
                      }
                      alt="User Avatar"
                    />
                  </Avatar>
                  <Button
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 z-10 border border-white/20 shadow-2xl cursor-pointer text-white rounded-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </React.Fragment>
              ) : (
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 z-10 border border-white/20 shadow-2xl cursor-pointer text-white rounded-full"
                  onClick={() => router.push("/auth")}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 left-4 right-4 z-50 md:hidden"
      >
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-white">AIPP</span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-white/20">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.link}
                      className="text-sm text-white/80 hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-full mt-2"
                  >
                    Login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
}
