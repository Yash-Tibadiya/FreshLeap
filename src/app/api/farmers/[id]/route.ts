import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Farmers, Products, Users, Orders, OrderItems } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm"; // Removed unused 'extract'

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

    const productIds = farmerProducts.map((p) => p.product_id);

    let ordersData: any[] = [];
    let totalCustomers = 0;
    let totalRevenue = 0;

    if (productIds.length > 0) {
      const orderItemsResult = await db
        .selectDistinct({ order_id: OrderItems.order_id })
        .from(OrderItems)
        .where(inArray(OrderItems.product_id, productIds))
        .execute();

      const orderIds = orderItemsResult
        .map((oi) => oi.order_id)
        .filter((id): id is string => id !== null && id !== undefined);

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
            },
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
                image_url: Products.image_url, // Optionally get image url
              })
              .from(OrderItems)
              .innerJoin(
                Products,
                eq(OrderItems.product_id, Products.product_id)
              )
              .where(eq(OrderItems.order_id, order.order_id))
              .execute();
            return { ...order, items }; // Combine order with its items
          })
        );

        ordersData = ordersWithItems; // Assign orders with items

        totalCustomers = new Set(ordersData.map((order) => order.user_id)).size;
        totalRevenue = ordersData.reduce(
          (sum, order) => sum + (order.total_price || 0),
          0
        );
      }
    }

    const products = await db
      .select()
      .from(Products)
      .where(eq(Products.farmer_id, farmer.farmer_id))
      .execute();

    const totalProducts = products.length;
    const totalOrders = ordersData.length;

    // Calculate monthly sales from ordersData with improved date handling
    const monthlySales = ordersData.reduce(
      (acc: Record<string, number>, order) => {
        if (order.created_at && typeof order.total_price === "number") {
          const date = new Date(order.created_at);
          // Format as 'YYYY-MM' for grouping (ensures correct chronological sorting)
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          acc[monthYear] = (acc[monthYear] || 0) + order.total_price;
        }
        return acc;
      },
      {}
    );

    // Sort the entries chronologically and limit to the last 12 months
    const sortedMonthlySalesEntries = Object.entries(monthlySales)
      .sort(([a], [b]) => a.localeCompare(b)) // Simple string comparison works for 'YYYY-MM' format
      .slice(-12); // Limit to last 12 months

    // Format for the chart [{ month: 'Jan', sales: 100 }, ...]
    const formattedSalesData = sortedMonthlySalesEntries.map(
      ([monthYear, sales]) => {
        const [year, monthNum] = monthYear.split("-");
        // Create a date object from the year and month
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);

        // Format the month name (e.g., "Jan")
        const monthName = date.toLocaleString("default", { month: "short" });

        // Add year if data spans multiple years
        const displayMonth = sortedMonthlySalesEntries.some(
          ([otherMonthYear]) => otherMonthYear.split("-")[0] !== year
        )
          ? `${monthName} ${year}`
          : monthName;

        return {
          month: displayMonth,
          sales: sales, // Assuming price is in cents
          rawDate: date, // Keep for accurate sorting
        };
      }
    );

    // Final sort to ensure chronological order and remove auxiliary sorting prop
    const formattedMonthlySales = formattedSalesData
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(({ month, sales }) => ({ month, sales }));

    // Then in the return statement, include the monthlySales data
    return NextResponse.json({
      farmer,
      products,
      orders: ordersData,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenue // Convert cents to dollars for consistency
      },
      monthlySales: formattedMonthlySales, // Include the formatted monthly sales data
    });
  } catch (error) {
    console.error("Error fetching farmer data:", error);
    return NextResponse.json(
      { error: "Failed to fetch farmer data" },
      { status: 500 }
    );
  }
}

// Add PATCH endpoint for updating farmer profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: farmerId } = await params;
    const body = await request.json();

    // Validate the request body - only allow specific fields to be updated
    const { farm_name, farm_location, contact_number } = body;

    if (!farm_name && !farm_location && !contact_number) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Check if the farmer exists
    const existingFarmer = await db
      .select()
      .from(Farmers)
      .where(eq(Farmers.farmer_id, farmerId))
      .limit(1)
      .execute();

    if (existingFarmer.length === 0) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    // Build the update object with only the provided fields
    const updateData: Partial<typeof Farmers.$inferInsert> = {};

    if (farm_name) updateData.farm_name = farm_name;
    if (farm_location) updateData.farm_location = farm_location;
    if (contact_number) updateData.contact_number = contact_number;

    // Set the updated_at timestamp
    updateData.updated_at = new Date();

    // Update the farmer profile
    await db
      .update(Farmers)
      .set(updateData)
      .where(eq(Farmers.farmer_id, farmerId))
      .execute();

    // Return the updated farmer data
    const updatedFarmer = await db
      .select()
      .from(Farmers)
      .where(eq(Farmers.farmer_id, farmerId))
      .limit(1)
      .execute();

    return NextResponse.json({
      message: "Farmer profile updated successfully",
      farmer: updatedFarmer[0],
    });
  } catch (error) {
    console.error("Error updating farmer profile:", error);
    return NextResponse.json(
      { error: "Failed to update farmer profile" },
      { status: 500 }
    );
  }
}
