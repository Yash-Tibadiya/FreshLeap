import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Farmers, Products, Users, Orders, OrderItems } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js App Router, params might be a Promise in some cases
    const { id: farmerId } = await params;

    console.log("farmerId:", farmerId);

    // Fetch farmer data from the database
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
      .where(eq(Farmers.user_id, farmerId))
      .limit(1)
      .execute();
    
    const farmerResultFirst = farmerResult[0];

    if (!farmerResultFirst) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    const farmer = {
      farmer_id: farmerResultFirst.farmer_id,
      user_id: farmerResultFirst.user_id,
      farm_name: farmerResultFirst.farm_name,
      farm_location: farmerResultFirst.farm_location,
      contact_number: farmerResultFirst.contact_number,
      created_at: farmerResultFirst.created_at,
      updated_at: farmerResultFirst.updated_at,
      username: farmerResultFirst.username,
    };
    
    // Fetch products from the database
    const products = await db
      .select()
      .from(Products)
      .where(eq(Products.farmer_id, farmer.farmer_id))
      .execute();
    
    // Fetch orders from the database
    const orders = farmer.user_id ? await db
      .select()
      .from(Orders)
      .where(eq(Orders.user_id, farmer.user_id))
      .execute() : [];
      
    // Calculate stats
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalCustomers = new Set(orders.map((order) => order.user_id)).size;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

    return NextResponse.json({
      farmer,
      products,
      orders,
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