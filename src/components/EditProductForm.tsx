"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Keep Card for structure if needed, but Dialog will wrap it
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryEnum } from "@/db/schema";
import { useState, useEffect } from "react";
// Define Product type locally for this component
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Define Product type locally matching FarmerDashboardClient
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

// Define the Zod schema for validation (same as add, image is optional for update)
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  category: z.enum(categoryEnum.enumValues),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  quantity_available: z.coerce.number().int().nonnegative("Quantity must be a non-negative integer"),
  image: z.instanceof(File).optional().nullable(), // Allow optional image update
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductFormProps {
  product: Product; // The product to edit
  farmerId: string;
  onSubmitSuccess: (updatedProduct: Product) => void; // Callback after successful submission
  onCancel: () => void; // Callback to cancel/close the form
  isOpen: boolean; // Control dialog visibility
  onOpenChange: (open: boolean) => void; // Handle dialog visibility change
}

export function EditProductForm({
  product,
  farmerId,
  onSubmitSuccess,
  onCancel,
  isOpen,
  onOpenChange
}: EditProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image_url);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    // Default values are set by useEffect below
  });

  // Set default values when the product prop changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category: product.category as typeof categoryEnum.enumValues[number],
        description: product.description,
        price: product.price,
        quantity_available: product.quantity_available,
        image: null, // Start with null, only include if a new file is selected
      });
      setPreviewUrl(product.image_url); // Reset preview URL
    }
  }, [product, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      form.setValue("image", null);
      setPreviewUrl(product.image_url); // Revert to original if file is deselected
    }
  };


  const onSubmit = async (values: ProductFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    // Append all necessary fields for PUT request
    formData.append("product_id", product.product_id);
    formData.append("farmer_id", farmerId); // Include farmer_id if needed by backend logic
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("description", values.description);
    formData.append("price", String(values.price));
    formData.append("quantity_available", String(values.quantity_available));
    if (values.image) {
      formData.append("image", values.image); // Only append if a new image is selected
    }
    // Note: If the backend expects image_url even if not updated, handle accordingly.
    // The current backend seems to handle optional image updates correctly.

    try {
      const response = await fetch(`/api/product`, { // Use the main product endpoint
        method: "PUT",
        body: formData, // Send as multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const result = await response.json();
      toast.success(result.message || "Product updated successfully!");
      onSubmitSuccess(result.product); // Pass the updated product back
      onOpenChange(false); // Close dialog on success
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "An error occurred while updating the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle closing/cancelling the dialog
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel(); // Call the cancel callback
      form.reset(); // Reset form state if dialog is closed
      setPreviewUrl(product.image_url); // Reset preview
    }
    onOpenChange(open); // Propagate state change
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px] bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the details for "{product.name}".</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="edit-product-form"> {/* Added ID */}
              {/* Image Preview */}
              {previewUrl && (
                <div className="mb-4">
                  <FormLabel>Current Image</FormLabel>
                  <div className="mt-2 aspect-video w-full max-w-sm mx-auto rounded-md overflow-hidden relative border dark:border-zinc-700">
                    <Image src={previewUrl} alt="Product image preview" layout="fill" objectFit="cover" />
                  </div>
                </div>
              )}
               <FormField
                control={form.control}
                name="image"
                render={({ field }) => ( // Destructure field to exclude value, onChange etc. if handled manually
                  <FormItem>
                    <FormLabel>Update Product Image (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange} // Use custom handler
                        // Don't spread {...field} if manually handling onChange/value
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Organic Apples" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryEnum.enumValues.map((category) => (
                          <SelectItem key={category} value={category} className="capitalize">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your product..." {...field} rows={4}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity_available"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Available</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Submit and Cancel Buttons are in DialogFooter */}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit" // This button needs to trigger the form submission
            form="edit-product-form" // Associate with the form
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
            // onClick={form.handleSubmit(onSubmit)} // Removed onClick, form attribute handles it
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}