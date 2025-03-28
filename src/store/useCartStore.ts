"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type CartItem = {
  description: undefined;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
};

type CartState = {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartCleared: boolean;
  setCartCleared: (cleared: boolean) => void;
};

// Helper functions to calculate derived state
function calculateItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Create Zustand store with persist middleware
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      totalPrice: 0,
      isCartCleared: false,

      addItem: (newItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (item) => item.product_id === newItem.product_id
        );

        if (existingItemIndex >= 0) {
          // Item already exists, increment quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += 1;

          set({
            items: updatedItems,
            itemCount: calculateItemCount(updatedItems),
            totalPrice: calculateTotalPrice(updatedItems),
            isCartCleared: false,
          });
        } else {
          // Add new item with quantity 1
          const updatedItems = [...items, { ...newItem, quantity: 1 }];

          set({
            items: updatedItems,
            itemCount: calculateItemCount(updatedItems),
            totalPrice: calculateTotalPrice(updatedItems),
            isCartCleared: false,
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter(
          (item) => item.product_id !== productId
        );

        set({
          items: updatedItems,
          itemCount: calculateItemCount(updatedItems),
          totalPrice: calculateTotalPrice(updatedItems),
        });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          // If quantity is 0 or negative, remove the item
          return get().removeItem(productId);
        }

        const updatedItems = items.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        );

        set({
          items: updatedItems,
          itemCount: calculateItemCount(updatedItems),
          totalPrice: calculateTotalPrice(updatedItems),
        });
      },

      clearCart: () => {
        set({
          items: [],
          itemCount: 0,
          totalPrice: 0,
          isCartCleared: true,
        });

        // Check if we're in a browser environment before accessing localStorage
        if (typeof window !== "undefined") {
          // Force synchronization with localStorage
          try {
            localStorage.setItem(
              "cart-storage",
              JSON.stringify({
                state: {
                  items: [],
                  itemCount: 0,
                  totalPrice: 0,
                  isCartCleared: true,
                },
                version: 0,
              })
            );
          } catch (error) {
            console.error("Failed to update localStorage:", error);
          }
        }
      },

      setCartCleared: (cleared) => {
        set({
          isCartCleared: cleared,
        });
      },
    }),
    {
      name: "cart-storage", // name of the item in localStorage
      storage: createJSONStorage(() => {
        // Safety check for SSR
        if (typeof window === "undefined") {
          // Return mock storage during SSR
          return {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null,
          };
        }
        return localStorage;
      }),
      skipHydration: true, // Skip hydration to prevent hydration mismatch errors
    }
  )
);