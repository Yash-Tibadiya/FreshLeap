// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/index";
// import { Products } from "@/db/schema";
// import { v4 as uuid } from "uuid";
// import { eq } from "drizzle-orm";
// import * as fs from "fs";
// import * as path from "path";
// import { mkdir, writeFile } from "fs/promises";

// // Define strict types
// type ProductCategory = "fruits" | "vegetables" | "dairy" | "meat" | "grains";

// // Ensure product-data directory exists
// const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
//   try {
//     await mkdir(dirPath, { recursive: true });
//   } catch (error: unknown) {
//     if (error instanceof Error && "code" in error && error.code !== "EEXIST") {
//       throw error;
//     }
//   }
// };

// // Save image to file system
// const saveImage = async (image: Buffer, fileName: string): Promise<string> => {
//   const productDataDir = path.join(process.cwd(), "public", "product-data");
//   await ensureDirectoryExists(productDataDir);

//   const filePath = path.join(productDataDir, fileName);
//   await writeFile(filePath, image);

//   // Return the URL path that will be stored in the database
//   return `/product-data/${fileName}`;
// };

// // Define interfaces for type safety
// interface ProductInput {
//   farmer_id: string;
//   name: string;
//   category: ProductCategory;
//   description: string;
//   price: number;
//   quantity_available: number;
//   image_url?: string;
// }

// interface ProductUpdateData extends Partial<ProductInput> {
//   updated_at: Date;
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Check if the request is multipart form data
//     const contentType = request.headers.get("content-type") || "";

//     let productData: ProductInput;

//     if (contentType.includes("multipart/form-data")) {
//       const formData = await request.formData();

//       // Extract form fields with type checking
//       productData = {
//         farmer_id: formData.get("farmer_id") as string,
//         name: formData.get("name") as string,
//         category: formData.get("category") as ProductCategory,
//         description: formData.get("description") as string,
//         price: parseInt(formData.get("price") as string),
//         quantity_available: parseInt(
//           formData.get("quantity_available") as string
//         ),
//       };

//       // Handle image upload
//       const imageFile = formData.get("image") as File | null;
//       if (imageFile) {
//         const product_id = uuid();
//         const fileExtension = imageFile.name.split(".").pop() || "jpg";
//         const fileName = `${product_id}.${fileExtension}`;

//         // Convert File to Buffer
//         const arrayBuffer = await imageFile.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);

//         // Save image and get URL
//         productData.image_url = await saveImage(buffer, fileName);
//       }
//     } else {
//       // Handle JSON request for backward compatibility
//       const body = await request.json();

//       productData = {
//         farmer_id: body.farmer_id,
//         name: body.name,
//         category: body.category,
//         description: body.description,
//         price: body.price,
//         quantity_available: body.quantity_available,
//         image_url: body.image_url || "",
//       };
//     }

//     const product_id = uuid();
//     const created_at = new Date();
//     const updated_at = new Date();

//     const newProduct = await db
//       .insert(Products)
//       .values({
//         product_id,
//         ...productData,
//         created_at,
//         updated_at,
//       })
//       .returning();

//     return NextResponse.json(
//       { product: newProduct[0], message: "Product created successfully" },
//       { status: 201 }
//     );
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     console.error("Error creating product:", error);
//     return NextResponse.json(
//       { message: "Failed to create product", error: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     const products = await db.select().from(Products);
//     return NextResponse.json({ products }, { status: 200 });
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     console.error("Error getting products:", error);
//     return NextResponse.json(
//       { message: "Failed to get products", error: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     // Check if the request is multipart form data
//     const contentType = request.headers.get("content-type") || "";

//     let updateData: ProductUpdateData;
//     let product_id: string;

//     if (contentType.includes("multipart/form-data")) {
//       const formData = await request.formData();

//       // Extract form fields
//       product_id = formData.get("product_id") as string;

//       if (!product_id) {
//         return NextResponse.json(
//           { message: "Product ID is required for updating" },
//           { status: 400 }
//         );
//       }

//       // Get existing product to check if we need to delete old image
//       const existingProduct = await db
//         .select()
//         .from(Products)
//         .where(eq(Products.product_id, product_id));

//       if (existingProduct.length === 0) {
//         return NextResponse.json(
//           { message: "Product not found" },
//           { status: 404 }
//         );
//       }

//       updateData = {
//         farmer_id: formData.get("farmer_id") as string,
//         name: formData.get("name") as string,
//         category: formData.get("category") as ProductCategory,
//         description: formData.get("description") as string,
//         price: parseInt(formData.get("price") as string),
//         quantity_available: parseInt(
//           formData.get("quantity_available") as string
//         ),
//         updated_at: new Date(),
//       };

//       // Handle image upload if provided
//       const imageFile = formData.get("image") as File | null;
//       if (imageFile) {
//         const fileExtension = imageFile.name.split(".").pop() || "jpg";
//         const fileName = `${product_id}.${fileExtension}`;

//         // Convert File to Buffer
//         const arrayBuffer = await imageFile.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);

//         // Save image and get URL
//         const image_url = await saveImage(buffer, fileName);
//         updateData.image_url = image_url;

//         // Delete old image if exists and different from new one
//         const oldImageUrl = existingProduct[0].image_url;
//         if (oldImageUrl && oldImageUrl !== image_url) {
//           try {
//             const oldImagePath = path.join(
//               process.cwd(),
//               "public",
//               oldImageUrl
//             );
//             if (fs.existsSync(oldImagePath)) {
//               fs.unlinkSync(oldImagePath);
//             }
//           } catch (error) {
//             console.error("Error deleting old image:", error);
//             // Continue with update even if image deletion fails
//           }
//         }
//       }
//     } else {
//       // Handle JSON request for backward compatibility
//       const body = await request.json();

//       product_id = body.product_id;

//       if (!product_id) {
//         return NextResponse.json(
//           { message: "Product ID is required for updating" },
//           { status: 400 }
//         );
//       }

//       updateData = {
//         farmer_id: body.farmer_id,
//         name: body.name,
//         category: body.category,
//         description: body.description,
//         price: body.price,
//         quantity_available: body.quantity_available,
//         updated_at: new Date(),
//       };

//       // Only update image_url if provided
//       if (body.image_url !== undefined) {
//         updateData.image_url = body.image_url;
//       }
//     }

//     const updatedProduct = await db
//       .update(Products)
//       .set(updateData)
//       .where(eq(Products.product_id, product_id))
//       .returning();

//     if (updatedProduct.length === 0) {
//       return NextResponse.json(
//         { message: "Product not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { product: updatedProduct[0], message: "Product updated successfully" },
//       { status: 200 }
//     );
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     console.error("Error updating product:", error);
//     return NextResponse.json(
//       { message: "Failed to update product", error: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { product_id } = await request.json();

//     if (!product_id) {
//       return NextResponse.json(
//         { message: "Product ID is required for deletion" },
//         { status: 400 }
//       );
//     }

//     // Get product to find image URL before deletion
//     const product = await db
//       .select()
//       .from(Products)
//       .where(eq(Products.product_id, product_id));

//     if (product.length === 0) {
//       return NextResponse.json(
//         { message: "Product not found" },
//         { status: 404 }
//       );
//     }

//     // Delete associated image if exists
//     const imageUrl = product[0].image_url;
//     if (imageUrl) {
//       try {
//         const imagePath = path.join(process.cwd(), "public", imageUrl);
//         if (fs.existsSync(imagePath)) {
//           fs.unlinkSync(imagePath);
//         }
//       } catch (error) {
//         console.error("Error deleting product image:", error);
//         // Continue with deletion response even if image deletion fails
//       }
//     }

//     // Actually delete the product from the database
//     await db
//       .delete(Products)
//       .where(eq(Products.product_id, product_id))
//       .execute();

//     return NextResponse.json(
//       { message: "Product deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     console.error("Error deleting product:", error);
//     return NextResponse.json(
//       { message: "Failed to delete product", error: errorMessage },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { Products } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { mkdir, writeFile } from "fs/promises";

// Define strict types
type ProductCategory = "fruits" | "vegetables" | "dairy" | "meat" | "grains";

// Ensure product-data directory exists
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code !== "EEXIST") {
      throw error;
    }
  }
};

// Save image to file system
const saveImage = async (image: Buffer, fileName: string): Promise<string> => {
  const productDataDir = path.join(process.cwd(), "public", "product-data");
  await ensureDirectoryExists(productDataDir);

  const filePath = path.join(productDataDir, fileName);
  await writeFile(filePath, image);

  // Return the URL path that will be stored in the database
  return `/product-data/${fileName}`;
};

// Define interfaces for type safety
interface ProductInput {
  farmer_id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  quantity_available: number;
  image_url?: string;
}

interface ProductUpdateData extends Partial<ProductInput> {
  updated_at: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart form data
    const contentType = request.headers.get("content-type") || "";

    let productData: ProductInput;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Extract form fields with type checking
      productData = {
        farmer_id: formData.get("farmer_id") as string,
        name: formData.get("name") as string,
        category: formData.get("category") as ProductCategory,
        description: formData.get("description") as string,
        price: parseInt(formData.get("price") as string),
        quantity_available: parseInt(
          formData.get("quantity_available") as string
        ),
      };

      // Handle image upload
      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        const product_id = uuid();
        const fileExtension = imageFile.name.split(".").pop() || "jpg";
        const fileName = `${product_id}.${fileExtension}`;

        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save image and get URL
        productData.image_url = await saveImage(buffer, fileName);
      }
    } else {
      // Handle JSON request for backward compatibility
      const body = await request.json();

      productData = {
        farmer_id: body.farmer_id,
        name: body.name,
        category: body.category,
        description: body.description,
        price: body.price,
        quantity_available: body.quantity_available,
        image_url: body.image_url || "",
      };
    }

    const product_id = uuid();
    const created_at = new Date();
    const updated_at = new Date();

    const newProduct = await db
      .insert(Products)
      .values({
        product_id,
        ...productData,
        created_at,
        updated_at,
      })
      .returning();

    return NextResponse.json(
      { product: newProduct[0], message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const products = await db.select().from(Products);
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error getting products:", error);
    return NextResponse.json(
      { message: "Failed to get products", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if the request is multipart form data
    const contentType = request.headers.get("content-type") || "";

    let updateData: ProductUpdateData;
    let product_id: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Extract form fields
      product_id = formData.get("product_id") as string;

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

      updateData = {
        farmer_id: formData.get("farmer_id") as string,
        name: formData.get("name") as string,
        category: formData.get("category") as ProductCategory,
        description: formData.get("description") as string,
        price: parseInt(formData.get("price") as string),
        quantity_available: parseInt(
          formData.get("quantity_available") as string
        ),
        updated_at: new Date(),
      };

      // Handle image upload if provided
      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        const fileExtension = imageFile.name.split(".").pop() || "jpg";
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
            const oldImagePath = path.join(
              process.cwd(),
              "public",
              oldImageUrl
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (error) {
            console.error("Error deleting old image:", error);
            // Continue with update even if image deletion fails
          }
        }
      }
    } else {
      // Handle JSON request for backward compatibility
      const body = await request.json();

      product_id = body.product_id;

      if (!product_id) {
        return NextResponse.json(
          { message: "Product ID is required for updating" },
          { status: 400 }
        );
      }

      updateData = {
        farmer_id: body.farmer_id,
        name: body.name,
        category: body.category,
        description: body.description,
        price: body.price,
        quantity_available: body.quantity_available,
        updated_at: new Date(),
      };

      // Only update image_url if provided
      if (body.image_url !== undefined) {
        updateData.image_url = body.image_url;
      }
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product", error: errorMessage },
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

    // Delete associated image if exists
    const imageUrl = product[0].image_url;
    if (imageUrl) {
      try {
        const imagePath = path.join(process.cwd(), "public", imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error("Error deleting product image:", error);
        // Continue with deletion response even if image deletion fails
      }
    }

    // Actually delete the product from the database
    await db
      .delete(Products)
      .where(eq(Products.product_id, product_id))
      .execute();

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product", error: errorMessage },
      { status: 500 }
    );
  }
}