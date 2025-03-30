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
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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

interface ProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ product, isOpen, onOpenChange }: ProductDialogProps) {
  if (!product) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Details for Product ID: {product.product_id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] no-scrollbar pr-4">
          {product.image_url && (
            <div className="aspect-square rounded-md overflow-hidden relative border dark:border-zinc-700">
              <Image
                src={product.image_url}
                alt={product.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div>
            <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
              Description
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                Category
              </p>
              <p className="capitalize text-gray-800 dark:text-gray-200">
                {product.category}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                Price
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                Quantity Available
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                {product.quantity_available} units
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                Status
              </p>
              {renderStatusBadge(
                product.quantity_available > 0
                  ? "in stock"
                  : "out of stock"
              )}
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                Date Added
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                {formatDate(product.created_at)}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                {formatDate(product.updated_at)}
              </p>
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