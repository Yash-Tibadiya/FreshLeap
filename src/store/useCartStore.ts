"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type CartItem = {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

type CartState = {
  items: CartItem[]
  itemCount: number
  totalPrice: number
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

// Helper functions to calculate derived state
function calculateItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      totalPrice: 0,
      
      addItem: (newItem) => {
        const { items } = get()
        const existingItemIndex = items.findIndex(item => item.product_id === newItem.product_id)
        
        if (existingItemIndex >= 0) {
          // Item already exists, increment quantity
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += 1
          
          set({
            items: updatedItems,
            itemCount: calculateItemCount(updatedItems),
            totalPrice: calculateTotalPrice(updatedItems)
          })
        } else {
          // Add new item with quantity 1
          const updatedItems = [...items, { ...newItem, quantity: 1 }]
          
          set({
            items: updatedItems,
            itemCount: calculateItemCount(updatedItems),
            totalPrice: calculateTotalPrice(updatedItems)
          })
        }
      },
      
      removeItem: (productId) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.product_id !== productId)
        
        set({
          items: updatedItems,
          itemCount: calculateItemCount(updatedItems),
          totalPrice: calculateTotalPrice(updatedItems)
        })
      },
      
      updateQuantity: (productId, quantity) => {
        const { items } = get()
        
        if (quantity <= 0) {
          // If quantity is 0 or negative, remove the item
          return get().removeItem(productId)
        }
        
        const updatedItems = items.map(item =>
          item.product_id === productId ? { ...item, quantity } : item
        )
        
        set({
          items: updatedItems,
          itemCount: calculateItemCount(updatedItems),
          totalPrice: calculateTotalPrice(updatedItems)
        })
      },
      
      clearCart: () => {
        set({
          items: [],
          itemCount: 0,
          totalPrice: 0
        })
      }
    }),
    {
      name: 'cart-storage', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage explicitly
      skipHydration: true, // Skip hydration to prevent hydration mismatch errors
    }
  )
)