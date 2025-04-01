import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { ProductReviews, Users, Products } from "@/db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { eq } from "drizzle-orm";

// GET: Get all reviews for a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Ensure productId is properly awaited/accessed
    const { productId } = await params;

    // Validate product ID
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db
      .select()
      .from(Products)
      .where(eq(Products.product_id, productId));

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch reviews for the product with user information
    const reviews = await db
      .select({
        review: ProductReviews,
        username: Users.username,
      })
      .from(ProductReviews)
      .leftJoin(Users, eq(ProductReviews.user_id, Users.user_id))
      .where(eq(ProductReviews.product_id, productId));

    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.review.rating!, 0);
      averageRating = sum / reviews.length;
    }

    return NextResponse.json(
      {
        success: true,
        reviews,
        averageRating,
        totalReviews: reviews.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product reviews",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: Create a new review for a specific product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          redirectUrl: "/sign-in",
        },
        { status: 401 }
      );
    }

    // Ensure productId is properly awaited/accessed
    const { productId } = await params;

    // Validate product ID
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db
      .select()
      .from(Products)
      .where(eq(Products.product_id, productId));

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { rating, comment } = body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating is required and must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await db
      .select()
      .from(ProductReviews)
      .where(
        eq(ProductReviews.user_id, session.user.id) &&
          eq(ProductReviews.product_id, productId)
      );

    if (existingReview.length > 0) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    // Create the review
    const created_at = new Date();

    const [newReview] = await db
      .insert(ProductReviews)
      .values({
        product_id: productId,
        user_id: session.user.id,
        rating,
        comment: comment || "",
        created_at,
      })
      .returning();

    // Get user data for response
    const [user] = await db
      .select({
        username: Users.username,
      })
      .from(Users)
      .where(eq(Users.user_id, session.user.id));

    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        review: {
          ...newReview,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product review:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create review",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete reviews for a specific product (admin operation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a farmer (only farmers can delete all reviews for their products)
    if (session.user.role !== "farmer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only farmers can delete all reviews for a product",
        },
        { status: 403 }
      );
    }

    // Ensure productId is properly awaited/accessed
    const { productId } = await params;

    // Validate product ID
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to the farmer
    const product = await db
      .select()
      .from(Products)
      .where(eq(Products.product_id, productId));

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // For farmers, check if the product belongs to them
    if (product[0].farmer_id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only manage reviews for your own products",
        },
        { status: 403 }
      );
    }

    // Delete all reviews for the product
    await db
      .delete(ProductReviews)
      .where(eq(ProductReviews.product_id, productId));

    return NextResponse.json(
      {
        success: true,
        message: "All reviews for this product have been deleted",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting product reviews:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete reviews",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
