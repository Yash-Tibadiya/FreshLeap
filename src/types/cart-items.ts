import { Cart } from "./carts";
import { Product } from "./products";

export interface CartItem {
  cart_item_id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;

  // Relations
  cart?: Cart;
  product?: Product;
}
