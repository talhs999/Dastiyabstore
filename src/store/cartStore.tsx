"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  color?: string;
  colorHex?: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string, color?: string) => void;
  updateQuantity: (id: string, color: string | undefined, qty: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (item) =>
        set((state) => {
          if (typeof window !== "undefined") {
            if ((window as any).fbq) {
              (window as any).fbq('track', 'AddToCart', {
                content_ids: [item.id],
                content_name: item.name,
                content_type: 'product',
                value: item.price,
                currency: 'PKR'
              });
            }
            
            // Track in our own internal Analytics
            fetch('/api/analytics/track-cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: item.id })
            }).catch(e => console.error("Analytics tracking failed", e));
          }
          const existing = state.items.find((i) => i.id === item.id && i.color === item.color);
          if (existing) {
            return {
              items: state.items.map((i) =>
                (i.id === item.id && i.color === item.color) ? { ...i, quantity: Math.min(i.quantity + 1, 5) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeFromCart: (id, color) =>
        set((state) => ({ items: state.items.filter((i) => !(i.id === id && i.color === color)) })),
      updateQuantity: (id, color, qty) =>
        set((state) => {
          if (qty < 1) return state;
          return {
            items: state.items.map((i) =>
              (i.id === id && i.color === color) ? { ...i, quantity: Math.min(qty, 5) } : i
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);

export function useCart() {
  const store = useCartStore();
  const totalItems = store.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = store.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return { ...store, totalItems, totalPrice };
}
