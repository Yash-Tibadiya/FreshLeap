import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Orders, OrderItems, Products } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      total_price,
      status,
      shipping_address,
      order_items,
    } = body;

    // Create order
    const order_id = uuid();
    const created_at = new Date();
    const updated_at = new Date();

    const newOrder = await db
      .insert(Orders)
      .values({
        order_id,
        user_id,
        total_price,
        status: status as any, // Cast to any to bypass TypeScript error
        shipping_address,
        created_at,
        updated_at,
      })
      .returning();

    // Create order items
    if (order_items && Array.isArray(order_items)) {
      for (const item of order_items) {
        const order_item_id = uuid();
        await db.insert(OrderItems).values({
          order_item_id,
          order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        });

        // Update product quantity
        const product = await db
          .select()
          .from(Products)
          .where(eq(Products.product_id, item.product_id));

        if (product.length > 0) {
          const newQuantity = (product[0]?.quantity_available || 0) - item.quantity;
          await db
            .update(Products)
            .set({ quantity_available: newQuantity >= 0 ? newQuantity : 0 })
            .where(eq(Products.product_id, item.product_id));
        }
      }
    }

    return NextResponse.json(
      { order: newOrder[0], message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Failed to create order", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get("user_id");
    const order_id = url.searchParams.get("order_id");

    if (order_id) {
      // Get specific order with its items
      const order = await db
        .select()
        .from(Orders)
        .where(eq(Orders.order_id, order_id));

      if (order.length === 0) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }

      const orderItems = await db
        .select()
        .from(OrderItems)
        .where(eq(OrderItems.order_id, order_id));

      return NextResponse.json(
        { order: order[0], items: orderItems },
        { status: 200 }
      );
    } else if (user_id) {
      // Get all orders for a user
      const orders = await db
        .select()
        .from(Orders)
        .where(eq(Orders.user_id, user_id));

      return NextResponse.json({ orders }, { status: 200 });
    } else {
      // Get all orders
      const orders = await db.select().from(Orders);
      return NextResponse.json({ orders }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error getting orders:", error);
    return NextResponse.json(
      { message: "Failed to get orders", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, shipping_address } = body;

    if (!order_id) {
      return NextResponse.json(
        { message: "Order ID is required for updating" },
        { status: 400 }
      );
    }

    const updated_at = new Date();

    const updateData: any = {
      updated_at,
    };

    if (status !== undefined) {
      updateData.status = status as any; // Cast to any to bypass TypeScript error
    }

    if (shipping_address !== undefined) {
      updateData.shipping_address = shipping_address;
    }

    const updatedOrder = await db
      .update(Orders)
      .set(updateData)
      .where(eq(Orders.order_id, order_id))
      .returning();

    if (updatedOrder.length === 0) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { order: updatedOrder[0], message: "Order updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Failed to update order", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json(
        { message: "Order ID is required for deletion" },
        { status: 400 }
      );
    }

    // Delete order items first
    await db
      .delete(OrderItems)
      .where(eq(OrderItems.order_id, order_id));

    // Then delete the order
    const deletedOrder = await db
      .delete(Orders)
      .where(eq(Orders.order_id, order_id))
      .returning();

    if (deletedOrder.length === 0) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Failed to delete order", error: error.message },
      { status: 500 }
    );
  }
}