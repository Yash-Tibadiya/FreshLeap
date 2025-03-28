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

  // State management
  const [orderNumber, setOrderNumber] = useState(
    /** @type {string | null} */ (null)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Mark component as mounted to avoid hydration mismatch
    setIsMounted(true);

    // Clear the cart immediately on success page load
    clearCart();

    // Only proceed if we have a session ID
    if (sessionId) {
      // Verify payment with backend and create order
      verifyPaymentAndCreateOrder(sessionId);
    } else {
      setIsLoading(false);
      setError("No session ID found. Unable to verify your order.");
    }
  }, [sessionId, clearCart]);

  // Function to verify payment with backend and create the order
  const verifyPaymentAndCreateOrder = async (sessionId) => {
    try {
      // Call the verification endpoint
      const response = await fetch(`/api/checkout?session_id=${sessionId}`);

      if (!response.ok) {
        throw new Error(`Verification failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Set the order number from the response
      if (data.orderNumber) {
        setOrderNumber(data.orderNumber);
      } else if (data.order && data.order.order_id) {
        setOrderNumber(data.order.order_id);
      } else {
        // Fallback if no order data returned
        const simpleOrderId = `ORD-${Math.abs(
          parseInt(sessionId.substring(0, 8), 16)
        )
          .toString()
          .slice(-6)}`;
        setOrderNumber(simpleOrderId);
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setError(
        "There was an issue verifying your payment. Please contact support."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Define handlers for button clicks
  const handleViewOrders = () => {
    router.push("/dashboard/customer/:id");
  };

  const handleContinueShopping = () => {
    router.push("/");
  };

  // Don't render anything during server-side rendering or until client mount
  if (!isMounted) {
    return <div className="min-h-screen bg-zinc-950"></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-lg p-8 flex flex-col items-center text-center">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p>Verifying your payment...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 py-6">
            <p className="text-xl font-bold mb-4">Payment Verification Issue</p>
            <p>{error}</p>
            <Button
              className="mt-6 bg-zinc-800 hover:bg-zinc-700"
              onClick={handleContinueShopping}
            >
              Return to Shop
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-green-600/20 p-4 mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold mb-3">Payment Successful!</h1>

            <p className="text-lg mb-6">
              Thank you for your purchase. Your order has been placed
              successfully.
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
          </>
        )}
      </div>
    </div>
  );
}