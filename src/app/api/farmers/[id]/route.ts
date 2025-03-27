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

    // For demo purposes, return mock data instead of fetching from the database
    // This allows us to demonstrate the functionality without needing actual database records
    
    // Mock farmer data
    const farmer = {
      farmer_id: farmerId,
      user_id: "user123",
      farm_name: "Green Valley Farm",
      farm_location: "Countryside, CA",
      contact_number: "+1 (555) 123-4567",
      created_at: new Date(),
      updated_at: new Date(),
      user: {
        username: "farmer_john",
        email: "john@greenvalleyfarm.com",
      },
    };
    
    // Mock products
    const products = [
      {
        product_id: "prod1",
        farmer_id: farmerId,
        name: "Organic Apples",
        category: "fruits",
        description: "Fresh organic apples grown without pesticides",
        price: 3.99,
        quantity_available: 150,
        image_url: "/product-data/4a83a559-eb07-4893-bf15-9c040f51df5b.webp",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: "prod2",
        farmer_id: farmerId,
        name: "Fresh Carrots",
        category: "vegetables",
        description: "Locally grown carrots, perfect for salads and cooking",
        price: 2.49,
        quantity_available: 200,
        image_url: "/product-data/4a83a559-eb07-4893-bf15-9c040f51df5b.webp",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: "prod3",
        farmer_id: farmerId,
        name: "Organic Milk",
        category: "dairy",
        description: "Fresh organic milk from grass-fed cows",
        price: 4.99,
        quantity_available: 50,
        image_url: "/product-data/4a83a559-eb07-4893-bf15-9c040f51df5b.webp",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: "prod4",
        farmer_id: farmerId,
        name: "Free-Range Eggs",
        category: "dairy",
        description: "Eggs from free-range chickens, rich in nutrients",
        price: 5.99,
        quantity_available: 100,
        image_url: "/product-data/4a83a559-eb07-4893-bf15-9c040f51df5b.webp",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    
    // Mock orders
    const orders = [
      {
        order_id: "order1",
        user_id: "user456",
        total_price: 29.95,
        status: "completed",
        shipping_address: "123 Main St, Anytown, USA",
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          username: "customer1",
          email: "customer1@example.com",
        },
        items: [
          {
            order_item_id: "item1",
            order_id: "order1",
            product_id: "prod1",
            quantity: 5,
            price: 3.99,
            product: {
              name: "Organic Apples",
            },
          },
          {
            order_item_id: "item2",
            order_id: "order1",
            product_id: "prod2",
            quantity: 3,
            price: 2.49,
            product: {
              name: "Fresh Carrots",
            },
          },
        ],
      },
      {
        order_id: "order2",
        user_id: "user789",
        total_price: 45.87,
        status: "shipped",
        shipping_address: "456 Oak St, Somewhere, USA",
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          username: "customer2",
          email: "customer2@example.com",
        },
        items: [
          {
            order_item_id: "item3",
            order_id: "order2",
            product_id: "prod3",
            quantity: 2,
            price: 4.99,
            product: {
              name: "Organic Milk",
            },
          },
          {
            order_item_id: "item4",
            order_id: "order2",
            product_id: "prod4",
            quantity: 6,
            price: 5.99,
            product: {
              name: "Free-Range Eggs",
            },
          },
        ],
      },
      {
        order_id: "order3",
        user_id: "user101",
        total_price: 19.96,
        status: "pending",
        shipping_address: "789 Pine St, Elsewhere, USA",
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          username: "customer3",
          email: "customer3@example.com",
        },
        items: [
          {
            order_item_id: "item5",
            order_id: "order3",
            product_id: "prod1",
            quantity: 5,
            price: 3.99,
            product: {
              name: "Organic Apples",
            },
          },
        ],
      },
    ];

    // Calculate stats
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalCustomers = new Set(orders.map((order) => order.user_id)).size;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);

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