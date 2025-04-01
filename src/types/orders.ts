import { User } from "./users";
import { OrderItem } from "./order-items";

export type OrderStatus = "pending" | "completed" | "cancelled" | "shipped" | null; // Allow null status

export interface Order {
  order_id: string;
  user_id: string | null; // Allow null for guest orders
  total_price: number | null; // Allow null if applicable
  status: OrderStatus;
  shipping_address: string | null; // Allow null if not provided
  created_at: Date | null; // Allow null if applicable
  updated_at: Date | null; // Allow null if applicable

  // Relations
  user?: User;
  orderItems?: OrderItem[];
}
