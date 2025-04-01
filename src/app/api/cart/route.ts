import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Carts, CartItems, Products } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, product_id, quantity } = body;

    // Validate required fields
    if (!user_id || !product_id || !quantity) {
      return NextResponse.json(
        { message: "User ID, Product ID, and quantity are required" },
        { status: 400 }
      );
    }

    // Check if product exists and has enough quantity
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

    if ((product[0]?.quantity_available || 0) < quantity) {
      return NextResponse.json(
        { message: "Not enough product quantity available" },
        { status: 400 }
      );
    }

    // Check if user has a cart, if not create one
    const cart = await db
      .select()
      .from(Carts)
      .where(eq(Carts.user_id, user_id));

    let cart_id;
    if (cart.length === 0) {
      // Create new cart
      cart_id = uuid();
      const created_at = new Date();
      const updated_at = new Date();

      await db
        .insert(Carts)
        .values({
          cart_id,
          user_id,
          created_at,
          updated_at,
        });
    } else {
      cart_id = cart[0].cart_id;
    }

    // Check if item already exists in cart
    const existingCartItem = await db
      .select()
      .from(CartItems)
      .where(
        and(
          eq(CartItems.cart_id, cart_id),
          eq(CartItems.product_id, product_id)
        )
      );

    if (existingCartItem.length > 0) {
      // Update existing cart item
      const newQuantity = existingCartItem[0].quantity + quantity;
      const updatedCartItem = await db
        .update(CartItems)
        .set({
          quantity: newQuantity,
          price: product[0].price, // Update price in case it changed
        })
        .where(eq(CartItems.cart_item_id, existingCartItem[0].cart_item_id))
        .returning();

      return NextResponse.json(
        { cart_item: updatedCartItem[0], message: "Cart item updated successfully" },
        { status: 200 }
      );
    } else {
      // Add new item to cart
      const cart_item_id = uuid();
      const newCartItem = await db
        .insert(CartItems)
        .values({
          cart_item_id,
          cart_id,
          product_id,
          quantity,
          price: product[0].price,
        })
        .returning();

      return NextResponse.json(
        { cart_item: newCartItem[0], message: "Item added to cart successfully" },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { message: "Failed to add item to cart", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's cart
    const cart = await db
      .select()
      .from(Carts)
      .where(eq(Carts.user_id, user_id));

    if (cart.length === 0) {
      return NextResponse.json(
        { message: "Cart not found", cart_items: [] },
        { status: 200 }
      );
    }

    // Get cart items
    const cart_id = cart[0].cart_id;
    const cartItems = await db
      .select()
      .from(CartItems)
      .where(eq(CartItems.cart_id, cart_id));

    // Get product details for each cart item
    const cartItemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = item.product_id ? await db
          .select()
          .from(Products)
          .where(eq(Products.product_id, item.product_id as string)) : [];

        return {
          ...item,
          product: product[0] || null,
        };
      })
    );

    return NextResponse.json(
      { cart: cart[0], cart_items: cartItemsWithDetails },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error getting cart:", error);
    return NextResponse.json(
      { message: "Failed to get cart", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_item_id, quantity } = body;

    if (!cart_item_id || quantity === undefined) {
      return NextResponse.json(
        { message: "Cart item ID and quantity are required" },
        { status: 400 }
      );
    }

    // Get cart item
    const cartItem = await db
      .select()
      .from(CartItems)
      .where(eq(CartItems.cart_item_id, cart_item_id));

    if (cartItem.length === 0) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Remove item from cart if quantity is 0 or negative
      await db
        .delete(CartItems)
        .where(eq(CartItems.cart_item_id, cart_item_id));

      return NextResponse.json(
        { message: "Item removed from cart" },
        { status: 200 }
      );
    } else {
      // Update cart item quantity
      const updatedCartItem = await db
        .update(CartItems)
        .set({ quantity })
        .where(eq(CartItems.cart_item_id, cart_item_id))
        .returning();

      return NextResponse.json(
        { cart_item: updatedCartItem[0], message: "Cart item updated successfully" },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { message: "Failed to update cart item", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cart_item_id = url.searchParams.get("cart_item_id");
    const user_id = url.searchParams.get("user_id");

    if (cart_item_id) {
      // Delete specific cart item
      const deletedCartItem = await db
        .delete(CartItems)
        .where(eq(CartItems.cart_item_id, cart_item_id))
        .returning();

      if (deletedCartItem.length === 0) {
        return NextResponse.json(
          { message: "Cart item not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Item removed from cart successfully" },
        { status: 200 }
      );
    } else if (user_id) {
      // Clear user's entire cart
      const cart = await db
        .select()
        .from(Carts)
        .where(eq(Carts.user_id, user_id));

      if (cart.length === 0) {
        return NextResponse.json(
          { message: "Cart not found" },
          { status: 404 }
        );
      }

      const cart_id = cart[0].cart_id;
      await db
        .delete(CartItems)
        .where(eq(CartItems.cart_id, cart_id));

      return NextResponse.json(
        { message: "Cart cleared successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Cart item ID or user ID is required" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json(
      { message: "Failed to remove item from cart", error: error.message },
      { status: 500 }
    );
  }
}