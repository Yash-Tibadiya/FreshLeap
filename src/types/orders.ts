import { User } from "./users";
import { OrderItem } from "./order-items";

export type OrderStatus = "pending" | "completed" | "cancelled" | "shipped";

export interface Order {
  order_id: string;
  user_id: string;
  total_price: number;
  status: OrderStatus;
  shipping_address: string;
  created_at: Date;
  updated_at: Date;

  // Relations
  user?: User;
  orderItems?: OrderItem[];
}
