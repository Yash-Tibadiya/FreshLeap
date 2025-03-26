import { User } from "./users";
import { CartItem } from "./cart-items";

export interface Cart {
  cart_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;

  // Relations
  user?: User;
  cartItems?: CartItem[];
}
