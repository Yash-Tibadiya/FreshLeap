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
    const { lineItems, metadata } = body;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      // Enable shipping address collection
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "IN"], // Add or modify countries as needed
      },
      // Require billing address collection
      billing_address_collection: "required",
      // Store user ID if available
      client_reference_id: metadata?.userId || undefined,
      // Optional additional metadata for tracking
      metadata: metadata || {},
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    console.error("Checkout session creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Failed to create checkout session", error: errorMessage },
      { status: 500 }
    );
  }
}

// Verification endpoint to handle order creation and verification
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

    // Retrieve the payment intent to get more details
    const paymentIntent = session.payment_intent
      ? await stripe.paymentIntents.retrieve(session.payment_intent as string)
      : null;

    // Ensure payment is successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          message: "Payment not completed",
          session_status: session.payment_status,
        },
        { status: 400 }
      );
    }

    // Get the user ID (client_reference_id) from the session
    // Generate a random UUID if no valid user ID is available
    let user_id;
    if (
      session.client_reference_id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        session.client_reference_id
      )
    ) {
      // User ID is a valid UUID
      user_id = session.client_reference_id;
    } else {
      // Generate a random UUID for guest orders
      user_id = uuid();
      console.log("Generated guest user ID:", user_id);
    }

    // Create order in the database
    const order_id = uuid();
    const created_at = new Date();
    const updated_at = new Date();

    // Get shipping address information
    let shippingAddress = "No shipping address provided";

    // Try to extract shipping address from payment intent first
    if (paymentIntent?.shipping?.address) {
      const address = paymentIntent.shipping.address;
      shippingAddress =
        `${address.line1 || ""}${address.line2 ? ", " + address.line2 : ""}, ${address.city || ""}, ${address.state || ""} ${address.postal_code || ""}, ${address.country || ""}`.trim();
    }
    // Fallback to customer details if available
    else if (session.customer_details?.address) {
      const address = session.customer_details.address;
      shippingAddress =
        `${address.line1 || ""}${address.line2 ? ", " + address.line2 : ""}, ${address.city || ""}, ${address.state || ""} ${address.postal_code || ""}, ${address.country || ""}`.trim();
    }

    // Retrieve line items
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    // Create the order record
    const newOrder = await db
      .insert(Orders)
      .values({
        order_id,
        user_id,
        total_price: Math.round((session.amount_total || 0) / 100), // Convert cents to dollars
        status: "pending", // Initial status
        shipping_address: shippingAddress,
        created_at,
        updated_at,
      })
      .returning();

    // Create order items for each purchased product
    for (const item of lineItems.data) {
      try {
        const order_item_id = uuid();
        const itemName = item.description || "";

        // Find the corresponding product in your database
        const products = await db
          .select()
          .from(Products)
          .where(eq(Products.name, itemName));

        const product = products[0];

        if (!product) {
          console.error(`Product not found for line item: ${itemName}`);
          continue;
        }

        // Insert the order item
        await db.insert(OrderItems).values({
          order_item_id,
          order_id,
          product_id: product.product_id,
          quantity: item.quantity || 1,
          price: Math.round(
            (item.amount_total || 0) / 100 / (item.quantity || 1)
          ), // Unit price
        });

        // Update product inventory
        if (product.quantity_available !== undefined) {
          const newQuantity = Math.max(
            0,
            product.quantity_available! - (item.quantity || 1)
          );
          await db
            .update(Products)
            .set({ quantity_available: newQuantity })
            .where(eq(Products.product_id, product.product_id));
        }
      } catch (error) {
        console.error(`Error creating order item: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder[0],
      orderNumber: order_id,
      message: "Order created successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    console.error("Order verification and creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify and create order",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
