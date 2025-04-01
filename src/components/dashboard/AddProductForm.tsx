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
} from "@/components/ui/card";
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
import { categoryEnum } from "@/db/schema"; // Assuming schema is accessible client-side or values are hardcoded/fetched
import { useState } from "react";
import Image from "next/image";

// Define the Zod schema for validation
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  category: z.enum(categoryEnum.enumValues),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  quantity_available: z.coerce
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative integer"),
  image: z.instanceof(File).optional(), // Allow optional image upload
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductFormProps {
  farmerId: string;
  onSubmitSuccess: (newProduct: any) => void; // Callback after successful submission
  onCancel: () => void; // Callback to cancel/close the form
}

export function AddProductForm({
  farmerId,
  onSubmitSuccess,
  onCancel,
}: AddProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: undefined, // Default to undefined or the first enum value
      description: "",
      price: 0,
      quantity_available: 0,
      image: undefined,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      form.setValue("image", undefined);
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (values: ProductFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("farmer_id", farmerId);
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("description", values.description);
    formData.append("price", String(values.price));
    formData.append("quantity_available", String(values.quantity_available));
    if (values.image) {
      formData.append("image", values.image);
    }

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        body: formData, // Send as multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const result = await response.json();
      toast.success(result.message || "Product added successfully!");
      onSubmitSuccess(result.product); // Pass the new product back
      form.reset(); // Reset form after successful submission
      setPreviewUrl(null); // Clear the image preview
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(
        error.message || "An error occurred while adding the product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-none shadow-lg">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>
          Fill in the details for your new product.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Image Preview - similar to EditProductForm */}
            {previewUrl && (
              <div className="mb-4">
                <FormLabel>Current Image</FormLabel>
                <div className="mt-2 aspect-square w-full max-w-sm mx-auto rounded-md overflow-hidden relative border dark:border-zinc-700">
                  <Image
                    src={previewUrl}
                    alt="Product image preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryEnum.enumValues.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="capitalize"
                        >
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
                    <Textarea
                      placeholder="Describe your product..."
                      {...field}
                    />
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
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
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
          </CardContent>
          <CardFooter className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
