import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Products, categoryEnum } from "@/db/schema";
import { sql, eq, and, gte, lte, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") as typeof categoryEnum.enumValues[number] | null;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const name = searchParams.get("name");

  try {
    // Build the query conditions dynamically
    const conditions = [];
    if (category && categoryEnum.enumValues.includes(category)) {
      conditions.push(eq(Products.category, category));
    }
    if (minPrice) {
      const minPriceNum = parseInt(minPrice, 10);
      if (!isNaN(minPriceNum)) {
        conditions.push(gte(Products.price, minPriceNum));
      }
    }
    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice, 10);
      if (!isNaN(maxPriceNum)) {
        conditions.push(lte(Products.price, maxPriceNum));
      }
    }
    if (name) {
      // Use ilike for case-insensitive search
      conditions.push(ilike(Products.name, `%${name}%`));
    }

    const query = db.select().from(Products).where(and(...conditions));

    // console.log("Executing query:", query.toSQL()); // For debugging

    const products = await query;

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}