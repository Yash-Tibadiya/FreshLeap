import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Orders, orderStatusEnum } from "@/db/schema"; // Import orderStatusEnum
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { status } = await request.json();

    // Validate status against the enum values
    if (!orderStatusEnum.enumValues.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${orderStatusEnum.enumValues.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Update the database
    const updatedOrderResult = await db
      .update(Orders)
      .set({
        status: status as (typeof orderStatusEnum.enumValues)[number], // Cast status to the enum type
        updated_at: new Date(), // Update the timestamp
      })
      .where(eq(Orders.order_id, orderId))
      .returning({
        // Return the updated fields
        order_id: Orders.order_id,
        status: Orders.status,
        updated_at: Orders.updated_at,
      });

    if (updatedOrderResult.length === 0) {
      return NextResponse.json(
        { error: "Order not found or failed to update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: updatedOrderResult[0], // Return the first updated record
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}