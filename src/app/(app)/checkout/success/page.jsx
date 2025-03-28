"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // Use JSDoc type annotation for .jsx files
  const [orderNumber, setOrderNumber] = useState(
    /** @type {string | null} */ (null)
  );

  // Add state to track client-side mounting
  const [isMounted, setIsMounted] = useState(false);

  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Mark component as mounted to avoid hydration mismatch
    setIsMounted(true);

    // Clear the cart immediately on success page load
    clearCart();

    // Use a fixed value for the orderNumber based on sessionId
    // This avoids using Date.now() which causes hydration mismatches
    if (sessionId && !orderNumber) {
      // Create a simple hash from the sessionId
      let hash = 0;
      for (let i = 0; i < sessionId.length; i++) {
        hash = (hash << 5) - hash + sessionId.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      const simpleOrderId = `ORD-${Math.abs(hash).toString().slice(-6)}`;
      setOrderNumber(simpleOrderId);
    }
  }, [sessionId, clearCart, orderNumber]);

  // Define handlers for button clicks to ensure cart is cleared
  const handleViewOrders = () => {
    clearCart(); // Ensure cart is cleared before navigation
    router.push("/dashboard/customer/:id");
  };

  const handleContinueShopping = () => {
    clearCart(); // Ensure cart is cleared before navigation
    router.push("/");
  };

  // Don't render anything during server-side rendering or until client mount
  // This prevents hydration mismatches
  if (!isMounted) {
    return <div className="min-h-screen bg-zinc-950"></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-lg p-8 flex flex-col items-center text-center">
        <div className="rounded-full bg-green-600/20 p-4 mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Payment Successful!</h1>

        <p className="text-lg mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {orderNumber && (
          <p className="bg-zinc-800 py-2 px-4 rounded-md mb-6">
            Order ID:{" "}
            <span className="font-mono font-medium">{orderNumber}</span>
          </p>
        )}

        <p className="text-zinc-400 text-sm mb-8">
          You will receive an email confirmation shortly with your order
          details.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            className="bg-green-600 hover:bg-green-700 flex-1 py-6"
            onClick={handleViewOrders}
          >
            View My Orders
          </Button>

          <Button
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800 flex-1 py-6"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
