"use client";

import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function CartButton() {
  // Use useState for client-side rendering to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get cart state and actions from Zustand store
  const {
    items,
    itemCount,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  // Handle hydration mismatch by only rendering after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Optional: Add network connection check
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network.");
      }

      const lineItems = items.map((item) => {
        let imageUrl = null;
        if (item.image_url && item.image_url.startsWith("/product-data/")) {
          imageUrl = `${window.location.origin}${item.image_url}`;
        }

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              ...(imageUrl && { images: [imageUrl] }),
            },
            unit_amount: Math.round(item.price * 100), // Ensure whole number of cents
          },
          quantity: item.quantity,
        };
      });

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineItems,
          // Optionally add more metadata
          metadata: {
            // Example: add timestamp or unique order identifier
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // More specific error handling
        switch (response.status) {
          case 400:
            throw new Error(
              "Invalid checkout request. Please check your cart."
            );
          case 403:
            throw new Error("Authentication required to complete checkout.");
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error(
              `Checkout failed: ${errorData.message || "Unknown server error"}`
            );
        }
      }

      const data = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Payment processing is temporarily unavailable.");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }

      // Attempt to clear cart before redirecting
      clearCart();
    } catch (error: any) {
      console.error("Checkout process error:", error);

      // More user-friendly error messaging
      const errorMessage = error.message.includes("network")
        ? "Network error. Please check your internet connection."
        : error.message.includes("Authentication")
          ? "Please log in to complete your purchase."
          : "We couldn't complete your checkout. Please try again.";

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything until after hydration to avoid mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="relative bg-zinc-800 border-zinc-700 hover:bg-zinc-700 p-5"
      >
        <ShoppingCart className="h-5 w-5 text-white" />
      </Button>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-zinc-800 border-zinc-700 hover:bg-zinc-700 p-5"
        >
          <ShoppingCart className="h-5 w-5 text-white" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md w-full"
      >
        <SheetHeader className="pb-4 border-b border-zinc-800">
          <SheetTitle className="text-white text-xl font-bold">
            Your Cart
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {items.length > 0 ? (
            <>
              <div className="space-y-6 max-h-[60vh] overflow-auto p-2">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between border-b border-zinc-800 pb-6"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative h-20 w-20 rounded-lg bg-zinc-800 overflow-hidden">
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-white mb-1">
                          {item.name}
                        </p>
                        <p className="text-base text-green-400 font-medium mb-3">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center bg-zinc-800 rounded-full w-fit">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-zinc-700"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3 text-white" />
                          </Button>
                          <span className="mx-3 text-base font-medium text-white">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-zinc-700"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full hover:bg-zinc-800 text-red-400 hover:text-red transition-colors"
                      onClick={() => removeItem(item.product_id)}
                    >
                      <Trash2 className="h-10 w-10" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="bg-zinc-800 my-4" />
              <div className="flex justify-between font-bold text-lg text-white mb-6 px-4">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-semibold rounded-sm transition-colors"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Checkout"}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-zinc-800 p-6 mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-300 text-lg font-medium mb-8">
                Your cart is empty
              </p>
              <SheetClose asChild>
                <Button
                  variant="secondary"
                  className="bg-zinc-200 border-zinc-700 text-black hover:bg-zinc-500 px-8 py-3 text-base rounded-full transition-all"
                >
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
