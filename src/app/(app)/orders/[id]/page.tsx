"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { CartButton } from "@/components/CartButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TruckIcon,
  Calendar,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Footer } from "@/components/Footer";

// Type definitions
interface OrderItem {
  order_item_id: string;
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
}

interface Order {
  order_id: string;
  user_id: string;
  total_price: number;
  status: "pending" | "completed" | "cancelled" | "shipped";
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuState, setMenuState] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [sessionStatus, router]);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      if (sessionStatus === "authenticated" && session?.user?.id) {
        try {
          // Make sure the user ID matches the route param
          if (params.id !== session.user.id) {
            setError("Unauthorized access");
            setLoading(false);
            return;
          }

          // Fetch orders from the API
          const response = await fetch(`/api/orders/user/${session.user.id}`);

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          setOrders(data.orders);
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError("Failed to load orders. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (sessionStatus !== "loading") {
      fetchOrders();
    }
  }, [session, sessionStatus, params.id, router]);

  // Helper function to render the status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-blue-500 text-white">
            <TruckIcon className="mr-1 h-3 w-3" /> Shipped
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="mr-1 h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven't placed any orders yet.
          </p>
          <Button onClick={() => router.push("/")}>Start Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <>
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
                      <Link href={`/products`}>
                        <span>All Products</span>
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
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order #{order.order_id}
                    </p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div>{renderStatusBadge(order.status)}</div>
                </div>

                <Separator className="my-4" />

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items &&
                        order.items.map((item) => (
                          <TableRow key={item.order_item_id}>
                            <TableCell className="font-medium">
                              {item.name || "Product"}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              ${item.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      {!order.items && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-4 text-gray-500"
                          >
                            Order details not available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex flex-wrap justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Shipping Address:
                    </p>
                    <p className="text-sm mt-1">{order.shipping_address}</p>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0">
                    <DollarSign className="h-5 w-5 text-green-500 mr-1" />
                    <span className="text-xl font-bold">
                      {order.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="flex flex-row items-center mt-6">
                    <div>
                      <Package className="mr-1 h-8 w-8" />
                    </div>
                    <div className="ml-1 text-xl font-bold">Track Order</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
