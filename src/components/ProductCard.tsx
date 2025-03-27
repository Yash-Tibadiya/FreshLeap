"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: {
    product_id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    quantity_available: number;
    image_url: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { product_id, name, category, description, price, quantity_available, image_url } = product;
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    addItem({
      product_id,
      name,
      price,
      image_url
    });
  };
  
  return (
    <Card className="overflow-hidden bg-zinc-900 border-zinc-800">
      <div className="relative aspect-square overflow-hidden">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">{category}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1 text-white">{name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mt-1">{description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-lg text-white">${(price / 100).toFixed(2)}</span>
          <span className="text-sm text-gray-400">
            {quantity_available > 0 ? `${quantity_available} available` : "Out of stock"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={handleAddToCart}
          disabled={quantity_available <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}