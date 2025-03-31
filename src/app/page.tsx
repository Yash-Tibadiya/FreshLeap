import { Suspense } from "react";
import { db } from "@/db/index";
import { Products } from "@/db/schema";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/Footer";


// Loading skeleton for products
function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

// Products grid with loading state
function ProductsGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.slice(-4).map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}

// Loading component for Suspense
function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

// Fetch products from database
async function getProducts() {
  try {
    const products = await db.select().from(Products);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden transition-colors duration-300 bg-gradient-to-tr from-green-400 to-green-800 dark:bg-gradient-to-tr dark:to-black dark:from-green-900">
      <Navbar />
      <main className="flex-1 container mx-auto py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Fresh Products</h1>
          <p className="text-gray-400 mb-8">
            Browse our selection of fresh, locally-sourced products from farmers
            near you.
          </p>

          <Suspense fallback={<ProductsLoading />}>
            <ProductsGrid products={products} />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  );
}
