import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { ProductReviews, Products } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      user_id,
      rating,
      comment,
    } = body;

    // Validate required fields
    if (!product_id || !user_id || !rating) {
      return NextResponse.json(
        { message: "Product ID, User ID, and rating are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db
      .select()
      .from(Products)
      .where(eq(Products.product_id, product_id));

    if (product.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await db
      .select()
      .from(ProductReviews)
      .where(
        and(
          eq(ProductReviews.product_id, product_id),
          eq(ProductReviews.user_id, user_id)
        )
      );

    if (existingReview.length > 0) {
      return NextResponse.json(
        { message: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create review
    const review_id = uuid();
    const created_at = new Date();

    const newReview = await db
      .insert(ProductReviews)
      .values({
        review_id,
        product_id,
        user_id,
        rating,
        comment: comment || "",
        created_at,
      })
      .returning();

    return NextResponse.json(
      { review: newReview[0], message: "Review submitted successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Failed to submit review", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const product_id = url.searchParams.get("product_id");
    const user_id = url.searchParams.get("user_id");
    const review_id = url.searchParams.get("review_id");

    if (review_id) {
      // Get specific review
      const review = await db
        .select()
        .from(ProductReviews)
        .where(eq(ProductReviews.review_id, review_id));

      if (review.length === 0) {
        return NextResponse.json(
          { message: "Review not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ review: review[0] }, { status: 200 });
    } else if (product_id) {
      // Get all reviews for a product
      const reviews = await db
        .select()
        .from(ProductReviews)
        .where(eq(ProductReviews.product_id, product_id));

      return NextResponse.json({ reviews }, { status: 200 });
    } else if (user_id) {
      // Get all reviews by a user
      const reviews = await db
        .select()
        .from(ProductReviews)
        .where(eq(ProductReviews.user_id, user_id));

      return NextResponse.json({ reviews }, { status: 200 });
    } else {
      // Get all reviews
      const reviews = await db.select().from(ProductReviews);
      return NextResponse.json({ reviews }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error getting reviews:", error);
    return NextResponse.json(
      { message: "Failed to get reviews", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { review_id, rating, comment } = body;

    if (!review_id) {
      return NextResponse.json(
        { message: "Review ID is required for updating" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (rating !== undefined) {
      updateData.rating = rating;
    }

    if (comment !== undefined) {
      updateData.comment = comment;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedReview = await db
      .update(ProductReviews)
      .set(updateData)
      .where(eq(ProductReviews.review_id, review_id))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { review: updatedReview[0], message: "Review updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { message: "Failed to update review", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { review_id } = await request.json();

    if (!review_id) {
      return NextResponse.json(
        { message: "Review ID is required for deletion" },
        { status: 400 }
      );
    }

    const deletedReview = await db
      .delete(ProductReviews)
      .where(eq(ProductReviews.review_id, review_id))
      .returning();

    if (deletedReview.length === 0) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { message: "Failed to delete review", error: error.message },
      { status: 500 }
    );
  }
}