"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-lg p-8 flex flex-col items-center text-center">
        <div className="rounded-full bg-red-600/20 p-4 mb-6">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Checkout Cancelled</h1>

        <p className="text-lg mb-6">
          Your payment was cancelled. No charges were made.
        </p>

        <p className="text-zinc-400 text-sm mb-8">
          If you experienced any issues during checkout, please contact our
          support team.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            className="bg-green-600 hover:bg-green-700 flex-1 py-6"
            onClick={() => router.push("/")}
          >
            Return to Cart
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
