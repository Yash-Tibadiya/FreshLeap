import { Suspense } from "react";
import { db } from "@/db/index";
import { Products } from "@/db/schema";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Truck, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/ui/cover";
import { Feature197 } from "@/components/accordion-feature-section";
import { RetroGrid } from "@/components/ui/retro-grid";
import { WorldMapB } from "@/components/WorldMap";
import Image from "next/image"; // Import Image
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const demoData = {
  features: [
    {
      id: 1,
      title: "What is the refund policy?",
      image: "/images/placeholder-1.png",
      description:
        "We offer a 30-day money-back guarantee. If you're unsatisfied with our product, request a refund within 30 days of purchase. Refunds are processed within 3-5 business days. Please note, refunds are available only for new customers, and limited to one per customer.",
    },
    {
      id: 2,
      title: "How do I place an order on FreshLeap?",
      image: "/images/placeholder-2.png",
      description:
        "Simply create an account, browse the marketplace, add your selected products to your cart, and proceed to checkout. You'll be able to choose your preferred payment method and delivery option.",
    },
    {
      id: 3,
      title: "How are the prices determined?",
      image: "/images/placeholder-3.png",
      description:
        "Prices are set by the individual farmers and are based on the market rates for fresh, locally grown produce. You can compare prices between different farmers to find the best deal.",
    },
    {
      id: 4,
      title: "Can I track my order after purchasing?",
      image: "/images/placeholder-4.png",
      description:
        "Yes, once your order is processed, you'll receive tracking information and updates regarding the status of your delivery.",
    },
    {
      id: 5,
      title: "What happens if the product I ordered is out of stock?",
      image: "/images/placeholder-5.png",
      description:
        "If a product is out of stock, you'll be notified immediately, and your order will either be adjusted or canceled based on your preference. You can choose to wait for the next batch or select an alternative product.",
    },
    {
      id: 6,
      title: "What products can I purchase on FreshLeap?",
      image: "/images/placeholder-2.png",
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
        <div className="bg-black">
          <Navbar />
        </div>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border bg-background md:shadow-xl z-0">
            <div className="container mx-auto max-w-6xl z-10 py-82">
              <div className="flex flex-col items-center text-center gap-y-8 z-10">
                {/* Headline with modern gradient text */}
                <h1
                  className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl 
                bg-gradient-to-br from-green-800 to-green-600 dark:from-green-300 dark:to-green-500 
                bg-clip-text text-transparent animate-fade-in z-10"
                >
                  Farm Fresh Products, <br />
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
            <RetroGrid />
          </div>
        </section>

        <main className="flex-1 container mx-auto pt-24 py-8">
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
                    bg-white/80 dark:bg-green-900/30 backdrop-blur/30
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
                  FreshLeap is more than just a marketplace. It&apos;s a
                  platform where users can easily browse and buy fresh,
                  locally-sourced produce, supporting farmers and connecting
                  communities to local food.
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

          <section>
            <WorldMapB />
          </section>
        </main>

        <footer className="border-t py-12 md:py-16 bg-black/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Column 1: Logo, Description, Social Links */}
              <div className="space-y-3">
                {/* Logo replaces H3 */}
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2"
                >
                  <Image
                    src="/images/logobgr.png"
                    alt="FreshLeap Logo" // Updated alt text
                    width={44}
                    height={44}
                    className="rounded-lg"
                    priority
                  />
                  <span className="font-bold text-2xl text-green-200 dark:text-green-600">
                    FreshLeap
                  </span>
                </Link>
                <p className="text-muted-foreground">
                  Connecting farmers and consumers directly.
                </p>
                <div className="flex space-x-4 pt-2">
                  <Link
                    href="#" // Keep as # or add your actual Facebook URL
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank" // Optional: Open social links in new tab
                    rel="noopener noreferrer" // Optional: Security best practice
                  >
                    <Facebook size={20} />
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link
                    href="#" // Keep as # or add your actual Instagram URL
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram size={20} />
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link
                    href="#" // Keep as # or add your actual Twitter URL
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter size={20} />
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link
                    href="#" // Keep as # or add your actual LinkedIn URL
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin size={20} />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>

              {/* Column 2: Company Links */}
              <div>
                <h4 className="font-medium text-base mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mission" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Our Mission
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/press" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Press
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: For Farmers Links */}
              <div>
                <h4 className="font-medium text-base mb-4">For Farmers</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/sign-up" // Assuming sign-up is for farmers too, adjust if needed
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Join as Producer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/farmer-resources" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Resources
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/success-stories" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Success Stories
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: For Consumers Links */}
              <div>
                <h4 className="font-medium text-base mb-4">For Consumers</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/how-it-works" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products" // Links to the main products page
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Find Local Produce
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/seasonal-guide" // Placeholder - create this page or link to '/products'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Seasonal Guide
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/support" // Placeholder - create this page or link to '/'
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section: Copyright and Legal Links */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FreshLeap. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link
                  href="/privacy-policy" // Placeholder - create this page
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service" // Placeholder - create this page
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookie-policy" // Placeholder - create this page
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
