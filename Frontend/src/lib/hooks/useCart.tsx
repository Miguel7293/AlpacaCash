"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type CartLot = {
  id: string;
  cat: string;
  origin: string;
  lb: number;
  price: number;
  prod: string;
  grade?: string;
  recordId?: string;
  productorId?: string;
};

type CartContextType = {
  items: CartLot[];
  addItem: (lot: CartLot) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "alpacash_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLot[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartLot[]) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((next: CartLot[]) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sessionStorage not available
    }
  }, []);

  const addItem = useCallback(
    (lot: CartLot) => {
      setItems((prev) => {
        if (prev.find((i) => i.id === lot.id)) return prev;
        const next = [...prev, lot];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    persist([]);
  }, [persist]);

  const total = items.reduce((s, i) => s + i.lb * i.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
