"use client"

import { ShoppingCart, Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/CartContext"
import Image from "next/image"

export function CartButton() {
  const { items, itemCount, totalPrice, updateQuantity, removeItem } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
          <ShoppingCart className="h-5 w-5 text-white" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-zinc-900 border-zinc-800 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {items.length > 0 ? (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 rounded-md bg-zinc-800 overflow-hidden">
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">${(item.price / 100).toFixed(2)}</p>
                        <div className="flex items-center mt-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3 text-white" />
                          </Button>
                          <span className="mx-2 text-sm text-white">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-zinc-800 text-gray-400 hover:text-white"
                      onClick={() => removeItem(item.product_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between font-medium text-white">
                <span>Total</span>
                <span>${(totalPrice / 100).toFixed(2)}</span>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Checkout</Button>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Your cart is empty</p>
              <Button variant="outline" className="mt-4 border-zinc-700 text-white hover:bg-zinc-800">Continue Shopping</Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}