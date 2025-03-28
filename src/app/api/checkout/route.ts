import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/index";
import { Orders, OrderItems, Products } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { lineItems } = body;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// New verification endpoint to handle order creation and verification
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { message: "No session ID provided" },
        { status: 400 }
      );
    }

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Ensure payment is successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }

    // Create order in the database
    const order_id = uuid();
    const created_at = new Date();
    const updated_at = new Date();

    // Note: You'll need to implement user authentication to get the user_id
    // For now, using a placeholder or null
    const user_id = session.client_reference_id || null;

    // Create the order
    const newOrder = await db
      .insert(Orders)
      .values({
        order_id,
        user_id,
        total_price: Math.round(session.amount_total! / 100), // Convert cents to dollars
        status: "pending", // Initial status
        shipping_address: session.shipping_details?.address
          ? `${session.shipping_details.address.line1}, ${session.shipping_details.address.city}, ${session.shipping_details.address.state} ${session.shipping_details.address.postal_code}, ${session.shipping_details.address.country}`
          : null,
        created_at,
        updated_at,
      })
      .returning();

    // Retrieve line items from the Stripe session
    const stripeLineItems =
      await stripe.checkout.sessions.listLineItems(sessionId);

    // Create order items
    for (const item of stripeLineItems.data) {
      const order_item_id = uuid();

      // You might need to map Stripe product names to your product IDs
      // This is a simplification and might need more robust handling
      const productResult = await db
        .select()
        .from(Products)
        .where(eq(Products.name, item.description!));

      const product = productResult[0];

      if (product) {
        await db.insert(OrderItems).values({
          order_item_id,
          order_id,
          product_id: product.product_id,
          quantity: item.quantity!,
          price: Math.round(item.price?.unit_amount! / 100), // Convert cents to dollars
        });

        // Update product quantity
        const newQuantity =
          (product.quantity_available || 0) - (item.quantity || 0);
        await db
          .update(Products)
          .set({
            quantity_available: newQuantity >= 0 ? newQuantity : 0,
          })
          .where(eq(Products.product_id, product.product_id));
      }
    }

    return NextResponse.json({
      order: newOrder[0],
      orderNumber: order_id,
      message: "Order created successfully",
    });
  } catch (error: any) {
    console.error("Order verification and creation error:", error);
    return NextResponse.json(
      {
        message: "Failed to verify and create order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
