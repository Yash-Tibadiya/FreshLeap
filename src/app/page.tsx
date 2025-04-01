import { Suspense } from "react";
import { db } from "@/db/index";
import { Products } from "@/db/schema";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ShoppingBasket,
  Truck,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/ui/cover";
import { Feature197 } from "@/components/accordion-feature-section";

const demoData = {
  features: [
    {
      id: 1,
      title: "What is the refund policy?",
      image: "https://shadcnblocks.com/images/block/placeholder-1.svg",
      description:
        "We offer a 30-day money-back guarantee. If you're unsatisfied with our product, request a refund within 30 days of purchase. Refunds are processed within 3-5 business days. Please note, refunds are available only for new customers, and limited to one per customer.",
    },
    {
      id: 2,
      title: "How do I place an order on FreshLeap?",
      image: "https://shadcnblocks.com/images/block/placeholder-2.svg",
      description:
        "Simply create an account, browse the marketplace, add your selected products to your cart, and proceed to checkout. You'll be able to choose your preferred payment method and delivery option.",
    },
    {
      id: 3,
      title: "How are the prices determined?",
      image: "https://shadcnblocks.com/images/block/placeholder-3.svg",
      description:
        "Prices are set by the individual farmers and are based on the market rates for fresh, locally grown produce. You can compare prices between different farmers to find the best deal.",
    },
    {
      id: 4,
      title: "Can I track my order after purchasing?",
      image: "https://shadcnblocks.com/images/block/placeholder-4.svg",
      description:
        "Yes, once your order is processed, you'll receive tracking information and updates regarding the status of your delivery.",
    },
    {
      id: 5,
      title: "What happens if the product I ordered is out of stock?",
      image: "https://shadcnblocks.com/images/block/placeholder-5.svg",
      description:
        "If a product is out of stock, you'll be notified immediately, and your order will either be adjusted or canceled based on your preference. You can choose to wait for the next batch or select an alternative product.",
    },
    {
      id: 6,
      title: "What products can I purchase on FreshLeap?",
      image: "https://shadcnblocks.com/images/block/placeholder-2.svg",
      description:
        "You can browse and purchase a variety of fresh, locally grown produce including fruits, vegetables, herbs, and other farm-fresh products directly from local farmers.",
    },
  ],
};

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
    <>
      <div className="relative flex flex-col min-h-screen overflow-hidden transition-colors duration-300 bg-gradient-to-r from-green-400 to-green-800 dark:bg-gradient-to-r dark:to-black dark:from-green-900">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-4 md:pt-32 md:pb-24 overflow-hidden">
          <div className="container mx-auto max-w-6xl z-10 py-28">
            <div className="flex flex-col items-center text-center gap-y-8 z-10">
              {/* Headline with modern gradient text */}
              <h1
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl 
                bg-gradient-to-br from-green-800 to-green-600 dark:from-green-300 dark:to-green-500 
                bg-clip-text text-transparent animate-fade-in z-10"
              >
                Farm Fresh Produce, <br />
                <span className="text-green-600 dark:text-green-400 z-10">
                  Directly to Your Door
                </span>
              </h1>

              {/* Subheadline with fluid typography */}
              <p className="text-balance mx-auto max-w-2xl text-slate-700 dark:text-slate-300 text-lg sm:text-xl md:text-2xl animate-fade-in delay-150 z-10">
                Shop the finest selection of locally-grown vegetables, fruits,
                and artisanal goods from farmers in your community.
              </p>
            </div>
          </div>
        </section>

        <main className="flex-1 container mx-auto py-8">
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Fresh Products</h1>
                <p className="text-gray-400 mb-8">
                  Browse our selection of fresh, locally-sourced products from
                  farmers near you.
                </p>
              </div>
              <div className="flex mb-8">
                <Button
                  variant="outline"
                  className="self-start md:self-auto p-5"
                >
                  <Link href={`/products`}>View All Products</Link>
                </Button>
              </div>
            </div>

            <Suspense fallback={<ProductsLoading />}>
              <ProductsGrid products={products} />
            </Suspense>
          </section>

          <section className="mb-12 py-20">
            <div>
              <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
                Get Fresh Products <br /> at <Cover>warp speed</Cover>
              </h1>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="py-16 px-4 bg-green-50/50 dark:bg-green-950/30 backdrop-blur/20 rounded-3xl">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold text-center text-green-800 dark:text-green-300 mb-12">
                Why Choose FreshLeap?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: <ShoppingBasket className="h-10 w-10" />,
                    title: "Local Sourcing",
                    description:
                      "All products come from farms within 50 miles of your location",
                  },
                  {
                    icon: <Sparkles className="h-10 w-10" />,
                    title: "Fresh Produce",
                    description:
                      "Harvested within 24 hours of delivery to ensure maximum freshness",
                  },
                  {
                    icon: <Users className="h-10 w-10" />,
                    title: "Support Farmers",
                    description:
                      "Fair prices that directly support local farming communities",
                  },
                  {
                    icon: <Truck className="h-10 w-10" />,
                    title: "Same-Day Delivery",
                    description:
                      "Get your fresh products delivered the same day you order",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-6 rounded-xl 
                    bg-white/80 dark:bg-slate-800/50 backdrop-blur/30
                    border border-green-100 dark:border-green-900/50 
                    shadow-sm hover:shadow-md transition duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mb-4 text-green-600 dark:text-green-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
              <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                <h2 className="text-4xl font-medium lg:text-5xl">
                  FreshLeap in numbers
                </h2>
                <p>
                  FreshLeap is more than just a marketplace. It's a platform
                  where users can easily browse and buy fresh, locally-sourced
                  produce, supporting farmers and connecting communities to
                  local food.
                </p>
              </div>

              <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
                <div className="space-y-4">
                  <div className="text-5xl font-bold">+1200</div>
                  <p>Local Farmers Participating</p>
                </div>
                <div className="space-y-4">
                  <div className="text-5xl font-bold">22 Million</div>
                  <p>Active Users Browsing and Purchasing</p>
                </div>
                <div className="space-y-4">
                  <div className="text-5xl font-bold">+7000</div>
                  <p>Transactions Per Day</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <Feature197 {...demoData} />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
