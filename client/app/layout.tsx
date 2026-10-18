import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tandem — Patterns, found together",
  description: "Build a basket and discover patterns in past purchases.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="tandem">
      <body>{children}</body>
    </html>
  );
}
