import { Product } from "./products";
import { User } from "./users";

export interface ProductReview {
  review_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: Date;

  // Relations
  product?: Product;
  user?: User;
}
