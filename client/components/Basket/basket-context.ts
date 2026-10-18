"use client";
import { createContext } from "react";
import type { Product } from "@/lib/api";

export const BasketContext = createContext<{
  items: Product[];
  revision: number;
  add: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
} | null>(null);
