import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Products } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      farmer_id,
      name,
      category,
      description,
      price,
      quantity_available,
    } = body;

    const product_id = uuid();
    const created_at = new Date();
    const updated_at = new Date();

    const newProduct = await db
      .insert(Products)
      .values({
        product_id,
        farmer_id,
        name,
        category,
        description,
        price,
        quantity_available,
        created_at,
        updated_at,
      })
      .returning();

    return NextResponse.json(
      { product: newProduct[0], message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const products = await db.select().from(Products);
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error("Error getting products:", error);
    return NextResponse.json(
      { message: "Failed to get products", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      farmer_id,
      name,
      category,
      description,
      price,
      quantity_available,
    } = body;

    if (!product_id) {
      return NextResponse.json(
        { message: "Product ID is required for updating" },
        { status: 400 }
      );
    }

    const updated_at = new Date();

    const updatedProduct = await db
      .update(Products)
      .set({
        farmer_id,
        name,
        category,
        description,
        price,
        quantity_available,
        updated_at,
      })
      .where(eq(Products.product_id, product_id))
      .returning();

    if (updatedProduct.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { product: updatedProduct[0], message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { message: "Product ID is required for deletion" },
        { status: 400 }
      );
    }

    const deletedProduct = await db
      .delete(Products)
      .where(eq(Products.product_id, product_id))
      .returning();

    if (deletedProduct.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product", error: error.message },
      { status: 500 }
    );
  }
}
