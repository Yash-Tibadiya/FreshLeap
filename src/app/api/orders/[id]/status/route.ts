import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js App Router, params might be a Promise in some cases
    const { id: orderId } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["pending", "completed", "cancelled", "shipped"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, completed, cancelled, shipped" },
        { status: 400 }
      );
    }

    // For demo purposes, we'll just return a success response
    // In a real app, this would update the database
    
    return NextResponse.json({
      order: {
        order_id: orderId,
        status: status,
        updated_at: new Date()
      },
      message: "Order status updated successfully"
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}