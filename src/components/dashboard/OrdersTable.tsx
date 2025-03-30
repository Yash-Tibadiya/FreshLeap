import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

interface OrdersTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, status: string) => Promise<void>;
  onRowClick: (order: Order) => void;
}

// Helper function to render status badge
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

export function OrdersTable({
  orders,
  onStatusChange,
  onRowClick,
}: OrdersTableProps) {
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