import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db/index";
import { Orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const session_id = url.searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json(
        { message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return NextResponse.json(
        { message: "Stripe session not found" },
        { status: 404 }
      );
    }

    // Get the user ID from session metadata
    const user_id = session.metadata?.user_id;

    if (!user_id) {
      return NextResponse.json(
        { message: "User ID not found in session metadata" },
        { status: 404 }
      );
    }

    // Get the most recent order for this user
    const orders = await db
      .select()
      .from(Orders)
      .where(eq(Orders.user_id, user_id))
      .orderBy(desc(Orders.created_at)) // Fixed this line
      .limit(1);

    if (orders.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: orders[0], session }, { status: 200 });
  } catch (error: any) {
    console.error("Error retrieving order session:", error);
    return NextResponse.json(
      { message: "Failed to retrieve order session", error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
