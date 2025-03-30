export type Farmer = {
  farmer_id: string;
  user_id: string;
  farm_name: string;
  farm_location: string;
  contact_number: string;
  created_at: Date;
  updated_at: Date;
  user?: {
    username: string;
    email: string;
  };
};

export type Product = {
  product_id: string;
  farmer_id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity_available: number;
  image_url: string;
  created_at: Date;
  updated_at: Date;
};

export type OrderItem = {
  order_item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
  product?: {
    name: string;
  };
};

export type Order = {
  order_id: string;
  user_id: string;
  total_price: number;
  status: string;
  shipping_address: string;
  created_at: Date;
  updated_at: Date;
  user?: {
    username: string;
    email: string;
  };
  items?: OrderItem[];
};

export type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
};