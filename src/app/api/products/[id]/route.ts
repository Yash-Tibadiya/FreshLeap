import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the id from params and ensure it's a string

    const id = String((await params).id);
    console.log("API: Fetching product with ID:", id);

    if (!id) {
      console.log("API: Missing product ID");
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Query the database for the product
    const product = await db
      .select()
      .from(Products)
      .where(eq(Products.product_id, id));

    // Check if product exists
    if (product.length === 0) {
      console.log("API: Product not found for ID:", id);
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Return the product
    return NextResponse.json(
      { success: true, product: product[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API: Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
