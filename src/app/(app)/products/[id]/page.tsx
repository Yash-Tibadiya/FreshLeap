import { db } from "@/db/index";
import { Products } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar"; // Assuming Navbar is needed
import { Button } from "@/components/ui/button"; // For potential "Add to Cart" button

// Define Product type (can be shared)
interface Product {
  product_id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity_available: number;
  image_url: string;
  created_at: string | null;
  updated_at: string | null;
  farmer_id: string | null;
}

// Fetch product data from the database
async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await db
      .select()
      .from(Products)
      .where(eq(Products.product_id, id))
      .limit(1); // Ensure only one product is returned

    if (product.length === 0) {
      return null;
    }
    // Drizzle returns an array, so take the first element
    // Need to cast price and quantity_available as they might be strings from DB
    return {
        ...product[0],
        price: Number(product[0].price),
        quantity_available: Number(product[0].quantity_available)
    } as Product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null; // Return null on error
  }
}

// Define the page component props
interface ProductPageProps {
  params: {
    id: string; // The dynamic route parameter [id]
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params;
  const product = await getProductById(id);

  // If product is not found, render the 404 page
  if (!product) {
    notFound();
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-tr from-green-400 to-green-800 dark:bg-gradient-to-tr dark:to-black dark:from-green-900 text-white dark:text-gray-100">
      {/* <Navbar /> */} {/* Uncomment if Navbar is needed */}
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden md:flex">
          {/* Product Image */}
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <Image
              src={product.image_url || "/placeholder-image.png"} // Provide a fallback image
              alt={product.name}
              layout="fill"
              objectFit="cover" // Adjust objectFit as needed (cover, contain)
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="inline-block bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100 text-xs font-semibold px-2.5 py-0.5 rounded mb-2 capitalize">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                {product.description}
              </p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">
                ${product.price.toFixed(2)} {/* Format price */}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {product.quantity_available > 0
                  ? `${product.quantity_available} available`
                  : "Out of stock"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={product.quantity_available <= 0} // Disable if out of stock
              >
                {product.quantity_available > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
              {/* Add more actions like "Add to Wishlist" if needed */}
            </div>
          </div>
        </div>

        {/* Optional: Related Products or Reviews Section */}
        {/* <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          {/* Component to display related products */}
        {/* </section> */}
      </main>
       {/* Footer can be added here if needed */}
    </div>
  );
}

// Optional: Generate static paths if you know the product IDs beforehand
// export async function generateStaticParams() {
//   const products = await db.select({ id: Products.product_id }).from(Products);
//   return products.map((product) => ({
//     id: product.id,
//   }));
// }