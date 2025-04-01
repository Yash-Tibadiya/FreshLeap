"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Import Pagination components
import { categoryEnum } from "@/db/schema";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { CartButton } from "@/components/CartButton";
import { Footer } from "@/components/Footer";

import debounce from "lodash/debounce";

// Define Product type (can be shared in a types file later)
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

// Products grid component
function ProductsGrid({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <ProductsLoading />;
  }
  if (products.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">
        No products found matching your criteria.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}

// Loading component
function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

// Main component wrapped with Suspense for searchParams
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Add useRouter
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  ); // Page state
  const [totalPages, setTotalPages] = useState(1); // Total pages state
  const productsPerPage = 8; // Products per page

  const { data: session } = useSession();
  const [menuState, setMenuState] = useState(false);

  // Initialize state from URL search params or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get("name") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Create a debounced search function that will update URL params
  const debouncedSearch = useCallback(
    debounce(() => {
      const params = new URLSearchParams(window.location.search);

      if (searchTerm) params.set("name", searchTerm);
      else params.delete("name");

      if (category && category !== "all") params.set("category", category);
      else params.delete("category");

      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");

      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");

      params.set("page", "1"); // Reset to page 1 on filter change

      router.push(`?${params.toString()}`, { scroll: false });
    }, 500), // 500ms debounce delay - adjust as needed
    [searchTerm, category, minPrice, maxPrice, router]
  );

  // Fetch products based on URL search params and page
  const fetchProducts = useCallback(
    async (paramsToUse: URLSearchParams, page: number) => {
      setIsLoading(true);
      // Read filters directly from the passed searchParams
      const currentCategory = paramsToUse.get("category") || "all";
      const currentMinPrice = paramsToUse.get("minPrice") || "";
      const currentMaxPrice = paramsToUse.get("maxPrice") || "";
      const currentSearchTerm = paramsToUse.get("name") || "";

      const apiParams = new URLSearchParams();
      if (currentCategory && currentCategory !== "all")
        apiParams.append("category", currentCategory);
      if (currentMinPrice) apiParams.append("minPrice", currentMinPrice);
      if (currentMaxPrice) apiParams.append("maxPrice", currentMaxPrice);
      if (currentSearchTerm) apiParams.append("name", currentSearchTerm);
      apiParams.append("page", page.toString()); // Add page
      apiParams.append("limit", productsPerPage.toString()); // Add limit

      // Update URL without navigation (optional, good for shareable links)
      // window.history.pushState(null, '', `?${params.toString()}`);

      try {
        const response = await fetch(
          `/api/products/search?${apiParams.toString()}`
        ); // Fix: Use apiParams here
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Assuming API returns { products: Product[], totalCount: number }
        const data: { products: Product[]; totalCount: number } =
          await response.json();
        setProducts(data.products);
        setTotalPages(Math.ceil(data.totalCount / productsPerPage));
        // Update current page state based on the page we actually fetched for
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
      // Only depend on stable values or things that change how fetching works fundamentally
    },
    [productsPerPage]
  );

  // Fetch products when search params change or on initial load
  useEffect(() => {
    // Fetch products when searchParams change (filters or page)
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    // Pass the current searchParams object to fetchProducts
    fetchProducts(searchParams, pageFromUrl);
  }, [fetchProducts, searchParams]); // Keep dependencies

  useEffect(() => {
    debouncedSearch();
    // Cleanup function to cancel debounced calls
    return () => debouncedSearch.cancel();
  }, [searchTerm, category, minPrice, maxPrice, debouncedSearch]);

  // Update state if URL search params change (e.g., browser back/forward)
  useEffect(() => {
    setSearchTerm(searchParams.get("name") || "");
    setCategory(searchParams.get("category") || "all"); // Default to "all"
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setCurrentPage(Number(searchParams.get("page")) || 1); // Update page state from URL
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL search params, which triggers useEffect -> fetchProducts
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) params.set("name", searchTerm);
    else params.delete("name");
    if (category && category !== "all") params.set("category", category);
    else params.delete("category"); // Adjust logic for "all"
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.set("page", "1"); // Reset to page 1 on new search/filter
    // Use router.push for Next.js App Router to trigger updates
    router.push(`?${params.toString()}`, { scroll: false });
    // fetchProducts will be triggered by the useEffect watching searchParams
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
    // The URL will be updated by the useEffect watching the state variables
    router.push(window.location.pathname, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const params = new URLSearchParams(window.location.search);
      params.set("page", newPage.toString());
      router.push(`?${params.toString()}`, { scroll: false });
      // fetchProducts will be triggered by useEffect watching searchParams
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden transition-colors duration-300 bg-gradient-to-tr from-green-400 to-green-800 dark:bg-gradient-to-tr dark:to-black dark:from-green-900">
      <nav
        data-state={menuState ? "active" : ""}
        className="fixed z-20 w-full border-b border-dashed dark:border-slate-700 bg-transparent backdrop-blur md:relative lg:dark:bg-transparent lg:bg-black/10"
      >
        <div className="m-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Image
                  src="/images/logobgr.png"
                  alt="Integration Platform"
                  width={44}
                  height={44}
                  className="rounded-lg"
                  priority
                />
                <span className="font-bold text-2xl text-green-200 dark:text-green-600">
                  FreshLeap
                </span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:pr-4">
                {session ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-200 dark:text-gray-300">
                      Welcome, {session?.user?.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex space-x-3 items-center">
                    <CartButton />
                    <Button asChild variant="outline" size="sm" className="p-5">
                      <Link href="/sign-in">
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="p-5 bg-green-500">
                      <Link href="/sign-up">
                        <span>Sign Up</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                {session && (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="p-5 bg-input/10 text-white"
                    >
                      <Link href={`/orders/${session?.user?.id}`}>
                        <span>My Orders</span>
                      </Link>
                    </Button>
                    <CartButton />
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="p-5 bg-input/10 text-white"
                      onClick={() => signOut()}
                    >
                      <Link href="/sign-in">
                        <span>Logout</span>
                      </Link>
                    </Button>
                    {session?.user?.role?.toLowerCase() !== "customer" && (
                      <Button asChild size="sm" className="p-5 bg-green-500">
                        <Link
                          href={`/dashboard/${session?.user?.role?.toLowerCase()}/${session?.user?.id}`}
                        >
                          <span>Dashboard</span>
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
        {/* Search Form */}
        <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 lg:sticky lg:top-20 h-fit lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto bg-card lg:bg-transparent lg:dark:bg-zinc-900 rounded-lg p-6 border lg:border-0 dark:border-zinc-700">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4 text-card-foreground lg:text-foreground">
              Filter Products
            </h2>
            {/* Product Name Search */}
            <div className="space-y-1.5">
              <label
                htmlFor="search-term"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Product Name
              </label>
              <Input
                id="search-term"
                type="text"
                placeholder="e.g., Organic Tomatoes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-zinc-700 dark:text-white"
              />
            </div>

            {/* Category Select */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="category"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="category"
                  className="dark:bg-zinc-700 dark:text-white"
                >
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryEnum.enumValues.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="min-price"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Min Price ($)
              </label>
              <Input
                id="min-price"
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                className="dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="max-price"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Max Price ($)
              </label>
              <Input
                id="max-price"
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                className="dark:bg-zinc-700 dark:text-white"
              />
            </div>

            {/* Reset button only - Search is automatic */}
            <div className="flex gap-2 md:col-span-1 items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-white dark:text-zinc-100">
            Explore Products
          </h1>
          {/* Products Display */}
          <ProductsGrid products={products} isLoading={isLoading} />

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      aria-disabled={currentPage <= 1}
                      className={
                        currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {/* Simple Page Number Display - Can be enhanced */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  {/* Add Ellipsis logic if needed for many pages */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      aria-disabled={currentPage >= totalPages}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>
      {/* Footer can be added here if needed */}
      <Footer />
    </div>
  );
}

// Wrap the component in Suspense because useSearchParams needs it
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ProductsPageContent />
    </Suspense>
  );
}

// Simple fallback for Suspense while searchParams are loading
function ProductsLoadingFallback() {
  // Updated fallback to match the new layout structure and dark theme
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Optional: Include a simplified Navbar skeleton */}
      <main className="flex-1 container mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
          <div className="space-y-6 p-6 rounded-lg bg-card lg:bg-transparent lg:dark:bg-zinc-900 border lg:border-0 dark:border-zinc-700">
            <Skeleton className="h-6 w-3/4 bg-muted" />
            {/* Skeleton inputs */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-1/3 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-1/4 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-1/3 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-1/3 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
            {/* Skeleton buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <Skeleton className="h-10 w-full bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
          </div>
        </aside>
        {/* Main Content Skeleton */}
        <div className="flex-1">
          <Skeleton className="h-8 w-1/2 mb-6 bg-muted" />
          <ProductsLoading /> {/* Use existing product loading grid */}
        </div>
      </main>
    </div>
  );
}
