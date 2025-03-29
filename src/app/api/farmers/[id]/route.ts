import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Farmers, Products, Users, Orders, OrderItems } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm"; // Import inArray and sql

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: farmerUserId } = await params; // Assuming the ID passed is the user_id associated with the farmer

    // Fetch farmer data using the user_id
    const farmerResult = await db
      .select({
        farmer_id: Farmers.farmer_id,
        user_id: Farmers.user_id,
        farm_name: Farmers.farm_name,
        farm_location: Farmers.farm_location,
        contact_number: Farmers.contact_number,
        created_at: Farmers.created_at,
        updated_at: Farmers.updated_at,
        username: Users.username, // Farmer's username
      })
      .from(Farmers)
      .innerJoin(Users, eq(Farmers.user_id, Users.user_id))
      .where(eq(Farmers.user_id, farmerUserId)) // Filter by user_id from params
      .limit(1)
      .execute();

    const farmerData = farmerResult[0];

    if (!farmerData) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    const farmer = {
        ...farmerData // Spread the fetched farmer data
    };

    // Fetch products associated with this farmer's farmer_id
    const farmerProducts = await db
      .select({ product_id: Products.product_id })
      .from(Products)
      .where(eq(Products.farmer_id, farmer.farmer_id))
      .execute();

    const productIds = farmerProducts.map(p => p.product_id);

    let orders: any[] = [];
    let totalCustomers = 0;
    let totalRevenue = 0;

    if (productIds.length > 0) {
      // Fetch order IDs that contain items from this farmer's products
      const orderItemsResult = await db
        .selectDistinct({ order_id: OrderItems.order_id }) // Get distinct order IDs
        .from(OrderItems)
        .where(inArray(OrderItems.product_id, productIds))
        .execute();

      // Filter out potential null/undefined values
      const orderIds = orderItemsResult.map(oi => oi.order_id).filter((id): id is string => id !== null && id !== undefined);

      if (orderIds.length > 0) {
        // Fetch the actual orders and join with Users to get customer details
        orders = await db
          .select({
            order_id: Orders.order_id,
            user_id: Orders.user_id,
            total_price: Orders.total_price,
            status: Orders.status,
            shipping_address: Orders.shipping_address,
            created_at: Orders.created_at,
            updated_at: Orders.updated_at,
            user: { // Include user details for the customer
              username: Users.username,
              email: Users.email, // Include email if needed
            }
          })
          .from(Orders)
          .innerJoin(Users, eq(Orders.user_id, Users.user_id)) // Join Orders with Users (customer)
          .where(inArray(Orders.order_id, orderIds))
          .orderBy(sql`${Orders.created_at} DESC`) // Optional: order by date
          .execute();

        // Recalculate stats based on fetched orders
        totalCustomers = new Set(orders.map((order) => order.user_id)).size;
        totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      }
    }

    // Fetch all products again for the response (already fetched IDs, but need full data)
     const products = await db
       .select()
       .from(Products)
       .where(eq(Products.farmer_id, farmer.farmer_id))
       .execute();

    const totalProducts = products.length;
    const totalOrders = orders.length; // Use the count of fetched relevant orders

    return NextResponse.json({
      farmer,
      products,
      orders, // Return the correctly fetched orders
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching farmer data:", error);
    return NextResponse.json(
      { error: "Failed to fetch farmer data" },
      { status: 500 }
    );
  }
}