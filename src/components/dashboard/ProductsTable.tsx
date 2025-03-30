import React from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddProductClick: () => void;
  onRowClick: (product: Product) => void;
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  onAddProductClick,
  onRowClick,
}: ProductsTableProps) {
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
                onClick={() => onRowClick(product)}
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
                <TableCell
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(product)}
                      title="Edit Product"
                      className="text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-0 shadow-xl dark:bg-zinc-900">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl text-zinc-900 dark:text-white">
                            Delete this Product?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                            This action cannot be undone. This will permanently
                            delete this Product from your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-zinc-700 bg-zinc-100 border-0 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(product.product_id)}
                            className="text-white bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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