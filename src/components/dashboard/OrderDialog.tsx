import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

// Helper function to format date
const formatDate = (dateString: Date | string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
  }
  return (
    <Badge
      className={`capitalize ${badgeClass} border-none px-2.5 py-0.5 text-xs font-medium`}
    >
      {status}
    </Badge>
  );
};

interface OrderDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDialog({ order, isOpen, onOpenChange }: OrderDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Details for Order #{order.order_id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] no-scrollbar pr-4">
          <div className="flex flex-wrap justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer: {order.user?.username || "N/A"}
              </p>
              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1.5" />
                Ordered on: {formatDate(order.created_at)}
              </div>
            </div>
            <div>{renderStatusBadge(order.status)}</div>
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
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <TableRow key={item.order_item_id}>
                      <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                        {item.name || item.product?.name || "Product"}
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
                {order.shipping_address}
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="text-sm font-semibold mr-2 text-gray-900 dark:text-gray-100">
                Total:
              </span>
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {order.total_price.toFixed(2)}
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
      </DialogContent>
    </Dialog>
  );
}