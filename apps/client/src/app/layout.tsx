/**
 * @file This file defines the root layout for the Next.js application.
 * It sets up the main HTML structure, including the `<html>` and `<body>` tags,
 * and wraps the application content with necessary providers. It also configures
 * the fonts used throughout the application.
 * @requires next/font/google
 * @requires ./globals.css
 * @requires ./providers
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

/**
 * Configures the Geist Sans font.
 * @type {object}
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Configures the Geist Mono font.
 * @type {object}
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata for the application, including title and description.
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "AI Pair Programmer",
  description: "An AI-powered pair programming assistant.",
};

/**
 * The root layout component for the application.
 * This component wraps all pages and provides a consistent structure.
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The root layout of the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
