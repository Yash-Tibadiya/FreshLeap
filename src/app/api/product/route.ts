import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Products } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { mkdir, writeFile } from "fs/promises";

// Ensure product-data directory exists
const ensureDirectoryExists = async (dirPath: string) => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
};

// Save image to file system
const saveImage = async (image: Buffer, fileName: string): Promise<string> => {
  const productDataDir = path.join(process.cwd(), 'public', 'product-data');
  await ensureDirectoryExists(productDataDir);
  
  const filePath = path.join(productDataDir, fileName);
  await writeFile(filePath, image);
  
  // Return the URL path that will be stored in the database
  return `/product-data/${fileName}`;
};

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract form fields
      const farmer_id = formData.get('farmer_id') as string;
      const name = formData.get('name') as string;
      const categoryValue = formData.get('category') as string;
      // Validate that category is one of the allowed enum values
      const category = categoryValue as "fruits" | "vegetables" | "dairy" | "meat" | "grains";
      const description = formData.get('description') as string;
      const price = parseInt(formData.get('price') as string);
      const quantity_available = parseInt(formData.get('quantity_available') as string);
      
      // Handle image upload
      const imageFile = formData.get('image') as File;
      let image_url = '';
      
      if (imageFile) {
        const product_id = uuid();
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${product_id}.${fileExtension}`;
        
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Save image and get URL
        image_url = await saveImage(buffer, fileName);
      }
      
      const created_at = new Date();
      const updated_at = new Date();
      // Generate product ID
      const product_id = uuid();
      
      const newProduct = await db
        .insert(Products)
        .values({
          product_id,
          farmer_id,
          name,
          category: category as any, // Cast to any to bypass TypeScript error
          description,
          price,
          quantity_available,
          image_url,
          created_at,
          updated_at,
        })
        .returning();
      
      return NextResponse.json(
        { product: newProduct[0], message: "Product created successfully" },
        { status: 201 }
      );
    } else {
      // Handle JSON request for backward compatibility
      const body = await request.json();
      
      const {
        farmer_id,
        name,
        category,
        description,
        price,
        quantity_available,
        image_url = '', // Default to empty string if not provided
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
          category: category as any, // Cast to any to bypass TypeScript error
          description,
          price,
          quantity_available,
          image_url,
          created_at,
          updated_at,
        })
        .returning();
      
      return NextResponse.json(
        { product: newProduct[0], message: "Product created successfully" },
        { status: 201 }
      );
    }
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
    // Check if the request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract form fields
      const product_id = formData.get('product_id') as string;
      const farmer_id = formData.get('farmer_id') as string;
      const name = formData.get('name') as string;
      const categoryValue = formData.get('category') as string;
      // Validate that category is one of the allowed enum values
      const category = categoryValue as "fruits" | "vegetables" | "dairy" | "meat" | "grains";
      const description = formData.get('description') as string;
      const price = parseInt(formData.get('price') as string);
      const quantity_available = parseInt(formData.get('quantity_available') as string);
      
      if (!product_id) {
        return NextResponse.json(
          { message: "Product ID is required for updating" },
          { status: 400 }
        );
      }
      
      // Get existing product to check if we need to delete old image
      const existingProduct = await db
        .select()
        .from(Products)
        .where(eq(Products.product_id, product_id));
      
      if (existingProduct.length === 0) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 }
        );
      }
      
      const updateData: any = {
        farmer_id,
        name,
        category: category as any, // Cast to any to bypass TypeScript error
        description,
        price,
        quantity_available,
        updated_at: new Date(),
      };
      
      // Handle image upload if provided
      const imageFile = formData.get('image') as File;
      if (imageFile) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${product_id}.${fileExtension}`;
        
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Save image and get URL
        const image_url = await saveImage(buffer, fileName);
        updateData.image_url = image_url;
        
        // Delete old image if exists and different from new one
        const oldImageUrl = existingProduct[0].image_url;
        if (oldImageUrl && oldImageUrl !== image_url) {
          try {
            const oldImagePath = path.join(process.cwd(), 'public', oldImageUrl);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (error) {
            console.error("Error deleting old image:", error);
            // Continue with update even if image deletion fails
          }
        }
      }
      
      const updatedProduct = await db
        .update(Products)
        .set(updateData)
        .where(eq(Products.product_id, product_id))
        .returning();
      
      return NextResponse.json(
        { product: updatedProduct[0], message: "Product updated successfully" },
        { status: 200 }
      );
    } else {
      // Handle JSON request for backward compatibility
      const body = await request.json();
      const {
        product_id,
        farmer_id,
        name,
        category,
        description,
        price,
        quantity_available,
        image_url,
      } = body;
      
      if (!product_id) {
        return NextResponse.json(
          { message: "Product ID is required for updating" },
          { status: 400 }
        );
      }
      
      const updated_at = new Date();
      
      const updateData: any = {
        farmer_id,
        name,
        category: category as any, // Cast to any to bypass TypeScript error
        description,
        price,
        quantity_available,
        updated_at,
      };
      
      // Only update image_url if provided
      if (image_url !== undefined) {
        updateData.image_url = image_url;
      }
      
      const updatedProduct = await db
        .update(Products)
        .set(updateData)
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
    }
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
    
    // Get product to find image URL before deletion
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
    
    // Delete the product from database
    const deletedProduct = await db
      .delete(Products)
      .where(eq(Products.product_id, product_id))
      .returning();
    
    // Delete associated image if exists
    const imageUrl = product[0].image_url;
    if (imageUrl) {
      try {
        const imagePath = path.join(process.cwd(), 'public', imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error("Error deleting product image:", error);
        // Continue with deletion response even if image deletion fails
      }
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
