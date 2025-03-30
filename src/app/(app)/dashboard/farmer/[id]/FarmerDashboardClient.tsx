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
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

// Import extracted components
import {
  DashboardHeader,
  DashboardNav,
  OrderDialog,
  OrdersTable,
  OverviewCards,
  ProductDialog,
  ProductsTable,
  SalesChart,
  Farmer,
  Product,
  Order,
  DashboardStats,
} from "@/components/dashboard";

// Import forms
import { AddProductForm } from "@/components/AddProductForm";
import { EditProductForm } from "@/components/EditProductForm";

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
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });

  // UI state
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
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

  // Profile update handler
  const handleProfileUpdate = (updatedFarmer: Farmer) => {
    setFarmer(updatedFarmer);
  };

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

  // Edit Product handlers
  const handleEditProduct = (product: Product) => {
    toast.info(`Editing product: ${product.name}`);
    setEditingProduct(product);
    setIsEditFormOpen(true);
  };

  const handleEditProductSuccess = (updatedProduct: Product) => {
    // Update the products list with the edited product
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.product_id === updatedProduct.product_id ? updatedProduct : p
      )
    );

    // If the product was selected in the product dialog, update it there too
    if (selectedProduct?.product_id === updatedProduct.product_id) {
      setSelectedProduct(updatedProduct);
    }

    toast.success("Product updated successfully");
  };

  // Delete Product handler
  const handleDeleteProduct = async (productId: string) => {
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

  // Order status change handler
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

  // Row click handlers
  const handleOrderRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleProductRowClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
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
      {/* Navigation */}
      <DashboardNav menuState={menuState} setMenuState={setMenuState} />

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 mt-16 md:mt-0">
        <DashboardHeader
          farmer={farmer}
          onProfileUpdate={handleProfileUpdate}
        />
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
                farmerId={farmer.farmer_id}
                onSubmitSuccess={handleAddProductSuccess}
                onCancel={handleHideAddProductForm}
              />
            ) : (
              <ProductsTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAddProductClick={handleShowAddProductForm}
                onRowClick={handleProductRowClick}
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

      {/* Dialogs */}
      <OrderDialog
        order={selectedOrder}
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
      />

      <ProductDialog
        product={selectedProduct}
        isOpen={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
      />

      {/* Edit Product Form */}
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          farmerId={farmer.farmer_id}
          onSubmitSuccess={handleEditProductSuccess}
          onCancel={() => setIsEditFormOpen(false)}
          isOpen={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
        />
      )}
    </>
  );
}
