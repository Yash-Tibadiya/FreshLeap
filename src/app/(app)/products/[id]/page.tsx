"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, StarHalf, ShoppingCart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import Navbar from "@/components/Navbar";

// Product interface
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

// Review interface
interface Review {
  review: {
    review_id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
  };
  username: string;
}

// Review statistics
interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

// Review form data
interface ReviewFormData {
  rating: number;
  comment: string;
}

// ProductDetail component
export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: "",
  });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Debug log for params
  useEffect(() => {
    console.log("Product Detail Page - params:", params);
  }, [params]);

  // Fetch product details
  useEffect(() => {
    async function fetchProductDetails() {
      if (!params.id) {
        console.error("No product ID in params");
        setApiError("Missing product ID");
        setLoading(false);
        return;
      }

      // Get the product ID (ensure it's a string)
      const productId = String(params.id);
      console.log("Fetching product with ID:", productId);

      try {
        setLoading(true);

        // Construct the API URL
        const apiUrl = `/api/products/${productId}`;
        console.log("Fetching from API URL:", apiUrl);

        const response = await fetch(apiUrl);
        console.log("API Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Product API error:", errorData);
          throw new Error(`Product not found (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log("Product data received:", data);

        if (!data.product) {
          console.error("No product in response data:", data);
          throw new Error("Invalid product data received");
        }

        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
        setApiError(error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [params.id]);

  // Fetch product reviews
  // useEffect(() => {
  //   async function fetchProductReviews() {
  //     if (!params.id) return;

  //     try {
  //       // Get the product ID (ensure it's a string)
  //       const productId = String(params.id);
  //       console.log("Fetching reviews for product ID:", productId);

  //       const apiUrl = `/api/review/${productId}`;
  //       console.log("Reviews API URL:", apiUrl);

  //       const response = await fetch(apiUrl);
  //       console.log("Reviews API response status:", response.status);

  //       if (!response.ok) {
  //         console.error("Error response from review API:", response.status);
  //         return;
  //       }

  //       const data = await response.json();
  //       console.log("Reviews data received:", data);

  //       if (data.success) {
  //         setReviews(data.reviews || []);
  //         setReviewStats({
  //           averageRating: data.averageRating || 0,
  //           totalReviews: data.totalReviews || 0,
  //         });

  //         // Check if the current user has already reviewed this product
  //         if (session?.user?.id) {
  //           const userReviewed = data.reviews.some(
  //             (review: Review) => review.review.user_id === session.user.id
  //           );
  //           setHasUserReviewed(userReviewed);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching reviews:", error);
  //     }
  //   }

  //   if (product) {
  //     fetchProductReviews();
  //   }
  
  const fetchProductReviews = async () => {
    if (!params.id) return;

    try {
      // Get the product ID (ensure it's a string)
      const productId = String(params.id);
      console.log("Fetching reviews for product ID:", productId);

      const apiUrl = `/api/review/${productId}`;
      console.log("Reviews API URL:", apiUrl);

      const response = await fetch(apiUrl);
      console.log("Reviews API response status:", response.status);

      if (!response.ok) {
        console.error("Error response from review API:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Reviews data received:", data);

      if (data.success) {
        setReviews(data.reviews || []);
        setReviewStats({
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
        });

        // Check if the current user has already reviewed this product
        if (session?.user?.id) {
          const userReviewed = data.reviews.some(
            (review: Review) => review.review.user_id === session.user.id
          );
          setHasUserReviewed(userReviewed);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (product) {
      fetchProductReviews();
    }
  }, [params.id, session?.user?.id, product]);

  // Handle "Add to Cart" button click
  const handleAddToCart = (e: React.MouseEvent) => {
    if (!product) return;

    // Stop propagation to prevent navigation when clicking the button
    e.stopPropagation();
    e.preventDefault();

    // Add the item to cart using the same structure as in ProductCard
    addItem({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      description: undefined,
    });

    toast.success(`Added to Cart`, {
      description: `${product.name} added to your cart`,
    });
  };

  // Handle review form input changes
  const handleReviewInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewFormData({
      ...reviewFormData,
      [name]: name === "rating" ? Number(value) : value,
    });
  };

  // Handle review form submission
  // const handleSubmitReview = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!session?.user) {
  //     router.push("/sign-in");
  //     return;
  //   }

  //   if (!params.id) return;

  //   try {
  //     setIsSubmittingReview(true);

  //     // Get the product ID (ensure it's a string)
  //     const productId = String(params.id);

  //     const response = await fetch(`/api/review/${productId}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(reviewFormData),
  //     });

  //     const data = await response.json();
  //     console.log("Review submission response:", data);

  //     if (data.success) {
  //       toast.success("Review Submitted", {
  //         description: "Thank you for your review!",
  //       });

  //       // Make sure the review data is properly structured before using it
  //       if (data.review && data.review.review) {
  //         // Add the new review to the list and update stats
  //         const newReview: Review = data.review;
  //         setReviews([...reviews, newReview]);
  //         setReviewStats({
  //           averageRating:
  //             (reviewStats.averageRating * reviewStats.totalReviews +
  //               newReview.review.rating) /
  //             (reviewStats.totalReviews + 1),
  //           totalReviews: reviewStats.totalReviews + 1,
  //         });
  //       } else {
  //         // Refresh reviews from the server instead of trying to update locally
  //         console.log(
  //           "Review submitted but structure doesn't match expected format. Refreshing data..."
  //         );
  //         // This will trigger the useEffect that fetches reviews
  //         // No need to call fetchProductReviews directly since product is already set
  //       }

  //       setHasUserReviewed(true);
  //       setIsReviewDialogOpen(false);
  //       setReviewFormData({ rating: 5, comment: "" });
  //     } else {
  //       toast.error("Error", {
  //         description: data.message || "Failed to submit review.",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error submitting review:", error);
  //     toast.error("Error", {
  //       description: "Something went wrong. Please try again.",
  //     });
  //   } finally {
  //     setIsSubmittingReview(false);
  //   }
  // };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    if (!params.id) return;

    try {
      setIsSubmittingReview(true);

      // Get the product ID (ensure it's a string)
      const productId = String(params.id);

      const response = await fetch(`/api/review/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewFormData),
      });

      const data = await response.json();
      console.log("Review submission response:", data);

      if (data.success) {
        toast.success("Review Submitted", {
          description: "Thank you for your review!",
        });

        // Always refresh reviews from the server after submission
        await fetchProductReviews();

        setIsReviewDialogOpen(false);
        setReviewFormData({ rating: 5, comment: "" });
      } else {
        toast.error("Error", {
          description: data.message || "Failed to submit review.",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="relative flex flex-col min-h-screen bg-gradient-to-tr from-green-400 to-green-800 dark:bg-gradient-to-tr dark:to-black dark:from-green-900 text-white dark:text-gray-100">
        <Navbar />
        <main className="flex-1 container mx-auto py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="md:col-span-1 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-48" />
              </div>
            </div>
          </div>
          <div className="mt-12">
            <Skeleton className="h-10 w-40 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If product not found or API error
  if (!product || apiError) {
    return (
      <div className="relative flex flex-col min-h-screen bg-gradient-to-tr from-green-400 to-green-800 dark:bg-gradient-to-tr dark:to-black dark:from-green-900 text-white dark:text-gray-100">
        <Navbar />
        <main className="flex-1 container mx-auto py-12 px-4 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-4">
            The product you're looking for does not exist or has been removed.
          </p>
          {apiError && (
            <p className="mb-8 text-red-300 max-w-lg text-center">
              Error details: {apiError}
            </p>
          )}
          <Button onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </main>
      </div>
    );
  }

  // Render Rating Stars component
  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarHalf className="text-yellow-400 fill-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="text-gray-300" />
        ))}
      </div>
    );
  };

  // Main component render
  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-tr from-green-400 to-green-800 dark:bg-gradient-to-tr dark:to-black dark:from-green-900 text-white dark:text-gray-100">
      <Navbar />
      <main className="flex-1 container mx-auto py-12 px-4">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="md:col-span-1 flex justify-center">
            <div className="relative h-96 w-full max-w-md overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "contain" }}
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={reviewStats.averageRating} />
                <span className="text-sm">
                  ({reviewStats.averageRating.toFixed(1)}) •{" "}
                  {reviewStats.totalReviews} reviews
                </span>
              </div>
              <p className="text-xl font-semibold mb-1">
                ${(product.price).toFixed(2)}
              </p>
              <p className="text-sm">
                Category: <span className="capitalize">{product.category}</span>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-200 dark:text-gray-300">
                {product.description}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="pt-4">
              <div className="flex items-center gap-4 mb-4">
                <p className="text-sm text-gray-300">
                  {product.quantity_available > 0
                    ? `${product.quantity_available} available`
                    : "Out of stock"}
                </p>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                disabled={product.quantity_available <= 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {session?.user && !hasUserReviewed && (
              <Dialog
                open={isReviewDialogOpen}
                onOpenChange={setIsReviewDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmitReview}
                    className="space-y-4 pt-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setReviewFormData({
                                ...reviewFormData,
                                rating: star,
                              })
                            }
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${star <= reviewFormData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="comment" className="text-sm font-medium">
                        Your Review
                      </label>
                      <Textarea
                        id="comment"
                        name="comment"
                        value={reviewFormData.comment}
                        onChange={handleReviewInputChange}
                        placeholder="Share your experience with this product..."
                        rows={5}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsReviewDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isSubmittingReview}
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <p className="text-lg mb-2">No reviews yet</p>
              <p className="text-gray-300">
                Be the first to review this product
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <Card
                  key={review.review.review_id}
                  className="bg-white/10 backdrop-blur-sm border-white/10"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold">{review.username}</h3>
                        <div className="flex items-center gap-2">
                          <RatingStars rating={review.review.rating} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">
                        {new Date(
                          review.review.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-200">{review.review.comment}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
