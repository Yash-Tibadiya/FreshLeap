import { Order } from "./orders";
import { Product } from "./products";

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;

  // Relations
  order?: Order;
  product?: Product;
}
