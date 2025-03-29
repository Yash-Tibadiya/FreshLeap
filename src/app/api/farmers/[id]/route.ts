import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Farmers, Products, Users, Orders, OrderItems } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: farmerUserId } = await params;

    const farmerResult = await db
      .select({
        farmer_id: Farmers.farmer_id,
        user_id: Farmers.user_id,
        farm_name: Farmers.farm_name,
        farm_location: Farmers.farm_location,
        contact_number: Farmers.contact_number,
        created_at: Farmers.created_at,
        updated_at: Farmers.updated_at,
        username: Users.username,
      })
      .from(Farmers)
      .innerJoin(Users, eq(Farmers.user_id, Users.user_id))
      .where(eq(Farmers.user_id, farmerUserId))
      .limit(1)
      .execute();

    const farmerData = farmerResult[0];

    if (!farmerData) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    const farmer = { ...farmerData };

    const farmerProducts = await db
      .select({ product_id: Products.product_id })
      .from(Products)
      .where(eq(Products.farmer_id, farmer.farmer_id))
      .execute();

    const productIds = farmerProducts.map(p => p.product_id);

    let ordersData: any[] = [];
    let totalCustomers = 0;
    let totalRevenue = 0;

    if (productIds.length > 0) {
      const orderItemsResult = await db
        .selectDistinct({ order_id: OrderItems.order_id })
        .from(OrderItems)
        .where(inArray(OrderItems.product_id, productIds))
        .execute();

      const orderIds = orderItemsResult.map(oi => oi.order_id).filter((id): id is string => id !== null && id !== undefined);

      if (orderIds.length > 0) {
        const fetchedOrders = await db
          .select({
            order_id: Orders.order_id,
            user_id: Orders.user_id,
            total_price: Orders.total_price,
            status: Orders.status,
            shipping_address: Orders.shipping_address,
            created_at: Orders.created_at,
            updated_at: Orders.updated_at,
            user: {
              username: Users.username,
              email: Users.email,
            }
          })
          .from(Orders)
          .innerJoin(Users, eq(Orders.user_id, Users.user_id))
          .where(inArray(Orders.order_id, orderIds))
          .orderBy(sql`${Orders.created_at} DESC`)
          .execute();

        // Fetch items for each order
        const ordersWithItems = await Promise.all(
          fetchedOrders.map(async (order) => {
            const items = await db
              .select({
                order_item_id: OrderItems.order_item_id,
                order_id: OrderItems.order_id,
                product_id: OrderItems.product_id,
                quantity: OrderItems.quantity,
                price: OrderItems.price,
                name: Products.name, // Get product name
                image_url: Products.image_url // Optionally get image url
              })
              .from(OrderItems)
              .innerJoin(Products, eq(OrderItems.product_id, Products.product_id))
              .where(eq(OrderItems.order_id, order.order_id))
              .execute();
            return { ...order, items }; // Combine order with its items
          })
        );

        ordersData = ordersWithItems; // Assign orders with items

        totalCustomers = new Set(ordersData.map((order) => order.user_id)).size;
        totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_price || 0), 0);
      }
    }

    const products = await db
      .select()
      .from(Products)
      .where(eq(Products.farmer_id, farmer.farmer_id))
      .execute();

    const totalProducts = products.length;
    const totalOrders = ordersData.length;

    return NextResponse.json({
      farmer,
      products,
      orders: ordersData, // Return orders with items included
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