import { Farmer } from "./farmers";
import { CartItem } from "./cart-items";
import { OrderItem } from "./order-items";
import { ProductReview } from "./product-reviews";

export type Category = "fruits" | "vegetables" | "dairy" | "meat" | "grains";

export interface Product {
  product_id: string;
  farmer_id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  quantity_available: number;
  created_at: Date;
  updated_at: Date;

  // Relations
  farmer?: Farmer;
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  reviews?: ProductReview[];
}
