"use client";
import { useContext } from "react";
import { BasketContext } from "./basket-context";

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error("Basket controls require BasketProvider");
  return context;
}
