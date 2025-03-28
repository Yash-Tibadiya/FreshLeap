import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Orders, OrderItems, Products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all orders for the user
    const userOrders = await db
      .select()
      .from(Orders)
      .where(eq(Orders.user_id, userId))
      .orderBy(desc(Orders.created_at));

    // For each order, get the order items
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        // Get all order items for this order
        const orderItems = await db
          .select({
            order_item_id: OrderItems.order_item_id,
            product_id: OrderItems.product_id,
            quantity: OrderItems.quantity,
            price: OrderItems.price,
            name: Products.name,
            image_url: Products.image_url,
          })
          .from(OrderItems)
          .where(eq(OrderItems.order_id, order.order_id))
          .leftJoin(Products, eq(OrderItems.product_id, Products.product_id));

        // Return the order with its items
        return {
          ...order,
          items: orderItems,
        };
      })
    );

    return NextResponse.json(
      {
        orders: ordersWithItems,
        message: "Orders retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { message: "Failed to retrieve orders", error: error.message },
      { status: 500 }
    );
  }
}
