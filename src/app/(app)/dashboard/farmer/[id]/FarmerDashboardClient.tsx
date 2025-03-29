"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users as UsersIcon,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Info, // Import Info icon for details
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddProductForm } from "@/components/AddProductForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { CartButton } from "@/components/CartButton";

// Types remain the same
type Farmer = {
  farmer_id: string;
  user_id: string;
  farm_name: string;
  farm_location: string;
  contact_number: string;
  created_at: Date;
  updated_at: Date;
  user?: {
    username: string;
    email: string;
  };
};

type Product = {
  product_id: string;
  farmer_id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity_available: number;
  image_url: string;
  created_at: Date;
  updated_at: Date;
};

type OrderItem = {
  order_item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
  product?: {
    name: string;
  };
};

type Order = {
  order_id: string;
  user_id: string;
  total_price: number;
  status: string;
  shipping_address: string;
  created_at: Date;
  updated_at: Date;
  user?: {
    username: string;
    email: string;
  };
  items?: OrderItem[];
};

// Helper functions remain the same
const formatDate = (dateString: Date | string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit", // Optionally add time
    minute: "2-digit",
  });
};

const renderStatusBadge = (status: string) => {
  let badgeClass = "bg-gray-100 text-gray-800";
  switch (status) {
    case "pending":
      badgeClass = "bg-yellow-100 text-yellow-800";
      break;
    case "shipped":
      badgeClass = "bg-blue-100 text-blue-800";
      break;
    case "completed":
      badgeClass = "bg-green-100 text-green-800";
      break;
    case "cancelled":
      badgeClass = "bg-red-100 text-red-800";
      break;
    // Add cases for product status if needed, e.g., 'in stock', 'out of stock'
    case "in stock":
      badgeClass = "bg-green-100 text-green-800";
      break;
    case "out of stock":
      badgeClass = "bg-red-100 text-red-800";
      break;
  }
  return (
    <Badge
      className={`capitalize ${badgeClass} border-none px-2.5 py-0.5 text-xs font-medium`}
    >
      {status}
    </Badge>
  );
};

// DashboardHeader and OverviewCards remain unchanged
function DashboardHeader({ farmer }: { farmer: Farmer }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-green-500">
          <AvatarImage src={`https://avatar.vercel.sh/${farmer.farm_name}`} />
          <AvatarFallback className="bg-green-100 text-green-800 text-xl">
            {farmer.farm_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{farmer.farm_name}</h1>
          <p className="text-gray-500">{farmer.farm_location}</p>
        </div>
      </div>
      <Button className="bg-green-600 hover:bg-green-700">
        <Pencil className="mr-2 h-4 w-4" />
        Edit Profile
      </Button>
    </div>
  );
}

function OverviewCards({ stats }: { stats: any }) {
  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="h-5 w-5 text-blue-600" />,
      description: "Active products in your inventory",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCart className="h-5 w-5 text-purple-600" />,
      description: "Orders received this month",
      change: "+18.2%",
      changeType: "positive",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: <UsersIcon className="h-5 w-5 text-orange-600" />,
      description: "Unique customers",
      change: "+5.7%",
      changeType: "positive",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: "Revenue this month",
      change: "+22.3%",
      changeType: "positive",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
              </div>
              <div className="p-2 rounded-full bg-gray-100">{card.icon}</div>
            </div>
            <div className="flex items-center mt-4">
              <Badge
                variant={
                  card.changeType === "positive" ? "default" : "destructive"
                }
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                {card.change}
              </Badge>
              <p className="text-xs text-gray-500 ml-2">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Update ProductsTable to accept onRowClick
function ProductsTable({
  products,
  onEdit,
  onDelete,
  onAddProductClick,
  onRowClick, // Add onRowClick prop
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddProductClick: () => void;
  onRowClick: (product: Product) => void; // Define prop type
}) {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product inventory. Click row for details.
          </CardDescription>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={onAddProductClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.product_id}
                onClick={() => onRowClick(product)} // Call onRowClick
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {!product.image_url && (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {/* Removed description from here, will show in dialog */}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.quantity_available > 10
                        ? "default"
                        : "destructive"
                    }
                    className={
                      product.quantity_available > 10
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {product.quantity_available} units
                  </Badge>
                </TableCell>
                {/* Stop propagation on action buttons */}
                <TableCell
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(product)}
                      title="Edit Product"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onDelete(product.product_id)}
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// OrdersTable remains unchanged
function OrdersTable({
  orders,
  onStatusChange,
  onRowClick,
}: {
  orders: Order[];
  onStatusChange?: (orderId: string, status: string) => Promise<void>;
  onRowClick: (order: Order) => void;
}) {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, status: string) => {
    if (!onStatusChange) return;
    setUpdatingOrderId(orderId);
    try {
      await onStatusChange(orderId, status);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          Manage customer orders. Click row for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.order_id}
                onClick={() => onRowClick(order)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  #{order.order_id.substring(0, 8)}
                </TableCell>
                <TableCell>{order.user?.username || "Unknown"}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {onStatusChange ? (
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order.order_id, value)
                      }
                      disabled={updatingOrderId === order.order_id}
                    >
                      <SelectTrigger
                        className={`w-[130px] capitalize ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="capitalize">
                          pending
                        </SelectItem>
                        <SelectItem value="shipped" className="capitalize">
                          shipped
                        </SelectItem>
                        <SelectItem value="completed" className="capitalize">
                          completed
                        </SelectItem>
                        <SelectItem value="cancelled" className="capitalize">
                          cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    renderStatusBadge(order.status)
                  )}
                </TableCell>
                <TableCell>${order.total_price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// SalesChart remains unchanged
function SalesChart() {
  const chartData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    sales: [4500, 3800, 5100, 4900, 6200, 5800],
  };
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly sales performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {chartData.months.map((month, i) => (
            <div key={month} className="flex flex-col items-center gap-2">
              <div
                className="bg-green-500 rounded-t-md w-12"
                style={{ height: `${chartData.sales[i] / 100}px` }}
              ></div>
              <span className="text-xs text-gray-500">{month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main dashboard client component
export default function FarmerDashboardClient({
  farmerId,
}: {
  farmerId: string;
}) {
  const router = useRouter();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false); // Renamed for clarity
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // State for selected product
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false); // State for product dialog

  const { data: session } = useSession();
  const [menuState, setMenuState] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/farmers/${farmerId}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch farmer data: ${response.statusText}`
          );
        }
        const data = await response.json();
        setFarmer(data.farmer);
        setProducts(data.products);
        setOrders(data.orders);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [farmerId]);

  // Handlers for Add Product Form
  const handleShowAddProductForm = () => setShowAddProductForm(true);
  const handleHideAddProductForm = () => setShowAddProductForm(false);

  const handleAddProductSuccess = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setStats((prevStats) => ({
      ...prevStats,
      totalProducts: prevStats.totalProducts + 1,
    }));
    setShowAddProductForm(false);
  };

  // Placeholder for Edit Product - could open a similar form/dialog
  const handleEditProduct = (product: Product) => {
    toast.info(`Editing product: ${product.name} (Not implemented yet)`);
    // TODO: Implement edit functionality - maybe set selectedProduct and open an EditProductForm dialog
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/product`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }
      setProducts(products.filter((p) => p.product_id !== productId));
      setStats((prevStats) => ({
        ...prevStats,
        totalProducts: prevStats.totalProducts - 1,
      }));
      toast.success("Product deleted successfully");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to update order status: ${response.statusText}`
        );
      }
      setOrders(
        orders.map((order) =>
          order.order_id === orderId ? { ...order, status } : order
        )
      );
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating order status:", error);
      return Promise.reject(error);
    }
  };

  // Handler for clicking an order row
  const handleOrderRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true); // Use specific state setter
  };

  // Handler for clicking a product row
  const handleProductRowClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true); // Use specific state setter
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  if (!farmer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Farmer Not Found</h1>
        <p className="text-gray-500 mb-6">
          The farmer you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <>
      {/* Navbar remains unchanged */}
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 mt-16 md:mt-0">
        {" "}
        {/* Add margin top for fixed nav */}
        <DashboardHeader farmer={farmer!} />{" "}
        {/* Added non-null assertion as farmer is checked */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewCards stats={stats} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SalesChart />
              <OrdersTable
                orders={orders.slice(0, 3)}
                onStatusChange={handleOrderStatusChange}
                onRowClick={handleOrderRowClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="products">
            {showAddProductForm ? (
              <AddProductForm
                farmerId={farmer!.farmer_id} // Added non-null assertion
                onSubmitSuccess={handleAddProductSuccess}
                onCancel={handleHideAddProductForm}
              />
            ) : (
              <ProductsTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAddProductClick={handleShowAddProductForm}
                onRowClick={handleProductRowClick} // Pass product row click handler
              />
            )}
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTable
              orders={orders}
              onStatusChange={handleOrderStatusChange}
              onRowClick={handleOrderRowClick}
            />
          </TabsContent>

          <TabsContent value="analytics">
            {/* Analytics content remains unchanged */}
            <div className="grid grid-cols-1 gap-6">
              <SalesChart />
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Sales by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-gray-500">
                      Detailed analytics will be available soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog remains unchanged */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[625px] bg-white dark:bg-zinc-900">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Details for Order #{selectedOrder.order_id.substring(0, 8)}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] no-scrollbar pr-4">
                {/* ... order details content ... */}
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customer: {selectedOrder.user?.username || "N/A"}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Ordered on: {formatDate(selectedOrder.created_at)}
                    </div>
                  </div>
                  <div>{renderStatusBadge(selectedOrder.status)}</div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    Order Items
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-700 dark:text-gray-300">
                          Product
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300">
                          Quantity
                        </TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300">
                          Price
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <TableRow key={item.order_item_id}>
                            <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                              {item.name || "Product"}
                            </TableCell>
                            <TableCell className="text-right text-gray-800 dark:text-gray-200">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right text-gray-800 dark:text-gray-200">
                              ${item.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-4 text-gray-500 dark:text-gray-400"
                          >
                            No items found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <Separator />
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Shipping Address:
                    </p>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0">
                    <span className="text-sm font-semibold mr-2 text-gray-900 dark:text-gray-100">
                      Total:
                    </span>
                    <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      ${selectedOrder.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[525px] bg-white dark:bg-zinc-900">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Details for Product ID:{" "}
                  {selectedProduct.product_id.substring(0, 8)}
                </DialogDescription>
              </DialogHeader>
              {/* Add overflow and max-height to this div */}
              <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] no-scrollbar pr-4">
                {selectedProduct.image_url && (
                  <div className="aspect-square rounded-md overflow-hidden relative border dark:border-zinc-700">
                    <Image
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProduct.description}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="capitalize text-gray-800 dark:text-gray-200">
                      {selectedProduct.category}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      Price
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      ${selectedProduct.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      Quantity Available
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedProduct.quantity_available} units
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    {renderStatusBadge(
                      selectedProduct.quantity_available > 0
                        ? "in stock"
                        : "out of stock"
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      Date Added
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {formatDate(selectedProduct.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {formatDate(selectedProduct.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {/* Optionally add Edit/Delete buttons here */}
                {/* <Button variant="outline" onClick={() => { handleEditProduct(selectedProduct); setIsProductDialogOpen(false); }}>Edit</Button> */}
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
