"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users as UsersIcon,
  DollarSign,
  Plus,
  Pencil,
  Trash2
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

// Types for our data
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
  name: string;
  category: string;
  description: string;
  price: number;
  quantity_available: number;
  image_url: string;
  created_at: Date;
  updated_at: Date;
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

type OrderItem = {
  order_item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
};

// Dashboard components
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
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
              </div>
              <div className="p-2 rounded-full bg-gray-100">{card.icon}</div>
            </div>
            <div className="flex items-center mt-4">
              <Badge variant={card.changeType === "positive" ? "default" : "destructive"} className="bg-green-100 text-green-800 hover:bg-green-100">
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

function ProductsTable({ products, onEdit, onDelete }: { 
  products: Product[], 
  onEdit: (product: Product) => void,
  onDelete: (productId: string) => void
}) {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage your product inventory</CardDescription>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
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
              <TableRow key={product.product_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {product.description}
                      </p>
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
                    variant={product.quantity_available > 10 ? "default" : "destructive"}
                    className={product.quantity_available > 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {product.quantity_available} units
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onDelete(product.product_id)}
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

function OrdersTable({ orders, onStatusChange }: { 
  orders: Order[], 
  onStatusChange?: (orderId: string, status: string) => Promise<void>
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
        <CardDescription>Manage customer orders</CardDescription>
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
              <TableRow key={order.order_id}>
                <TableCell className="font-medium">#{order.order_id.substring(0, 8)}</TableCell>
                <TableCell>{order.user?.username || "Unknown"}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {onStatusChange ? (
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) => handleStatusChange(order.order_id, value)}
                      disabled={updatingOrderId === order.order_id}
                    >
                      <SelectTrigger className={`w-[130px] capitalize ${
                        order.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : order.status === "pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : order.status === "cancelled" 
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="capitalize">pending</SelectItem>
                        <SelectItem value="shipped" className="capitalize">shipped</SelectItem>
                        <SelectItem value="completed" className="capitalize">completed</SelectItem>
                        <SelectItem value="cancelled" className="capitalize">cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${
                        order.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : order.status === "pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : order.status === "cancelled" 
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </Badge>
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

function SalesChart() {
  // This would be replaced with real data
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
export default function FarmerDashboardClient({ farmerId }: { farmerId: string }) {
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch data from the API
        const response = await fetch(`/api/farmers/${farmerId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch farmer data: ${response.statusText}`);
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

  const handleEditProduct = (product: Product) => {
    // In a real app, this would open a modal or navigate to an edit page
    toast.info(`Editing product: ${product.name}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    // In a real app, this would call an API to delete the product
    // For now, we'll just update the local state
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProducts(products.filter(p => p.product_id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };
  
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      // Call the API to update the order status
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }
      
      // Update the local state
      setOrders(orders.map(order => 
        order.order_id === orderId 
          ? { ...order, status } 
          : order
      ));
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating order status:", error);
      return Promise.reject(error);
    }
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
        <p className="text-gray-500 mb-6">The farmer you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardHeader farmer={farmer} />
      
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
            <OrdersTable orders={orders.slice(0, 3)} onStatusChange={handleOrderStatusChange} />
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <ProductsTable 
            products={products} 
            onEdit={handleEditProduct} 
            onDelete={handleDeleteProduct} 
          />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersTable orders={orders} onStatusChange={handleOrderStatusChange} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-6">
            <SalesChart />
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Sales by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">Detailed analytics will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}