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

  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Verify the checkout session
    const verifyCheckoutSession = async () => {
      try {
        const response = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error("Failed to verify checkout session");
        }

        const data = await response.json();

        // Set order number if provided by the server
        if (data.orderNumber) {
          setOrderNumber(data.orderNumber);
        }

        // Clear the cart after successful verification
        clearCart();
      } catch (error) {
        console.error("Checkout verification error:", error);
      }
    };

    if (sessionId) {
      verifyCheckoutSession();
    }
  }, [sessionId, clearCart]);

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
            onClick={() => router.push("/dashboard/customer/:id")}
          >
            View My Orders
          </Button>

          <Button
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800 flex-1 py-6"
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
