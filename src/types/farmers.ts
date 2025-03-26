import { User } from "./users";
import { Product } from "./products";

export interface Farmer {
  farmer_id: string;
  user_id: string;
  farm_name: string;
  farm_location: string;
  contact_number: string;
  created_at: Date;
  updated_at: Date;

  // Relations
  user?: User;
  products?: Product[];
}
