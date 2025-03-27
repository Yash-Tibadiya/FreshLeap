"use client"

import { useRef, useEffect } from "react"
import { useCartStore } from "@/store/useCartStore"

/**
 * This component initializes the Zustand store on the client side
 * to prevent hydration mismatches in Next.js
 */
export function StoreInitializer() {
  const initialized = useRef(false)
  
  useEffect(() => {
    if (!initialized.current) {
      // Initialize the store by calling a method
      useCartStore.persist.rehydrate()
      initialized.current = true
    }
  }, [])
  
  return null
}