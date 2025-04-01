import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Products, categoryEnum } from "@/db/schema";
import { eq, and, gte, lte, ilike, count } from "drizzle-orm"; // Import count

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") as typeof categoryEnum.enumValues[number] | null;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const name = searchParams.get("name");
  const page = parseInt(searchParams.get("page") || "1", 10); // Get page, default to 1
  const limit = parseInt(searchParams.get("limit") || "8", 10); // Get limit, default to 8
 
  // Validate page and limit
  const safePage = Math.max(1, isNaN(page) ? 1 : page);
  const safeLimit = Math.max(1, isNaN(limit) ? 8 : limit);
  const offset = (safePage - 1) * safeLimit;
 
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

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Query for total count
    const countQuery = db.select({ value: count() }).from(Products).where(whereCondition);

    // Query for paginated products
    const productsQuery = db.select().from(Products).where(whereCondition).limit(safeLimit).offset(offset);

    // console.log("Executing count query:", countQuery.toSQL()); // For debugging
    // console.log("Executing products query:", productsQuery.toSQL()); // For debugging

    // Execute both queries
    const [countResult, products] = await Promise.all([
      countQuery,
      productsQuery
    ]);

    const totalCount = countResult[0]?.value ?? 0;

    return NextResponse.json({ products, totalCount });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}