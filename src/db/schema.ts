import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define the role enum
export const roleEnum = pgEnum("role", ["farmer", "customer"]);
export const categoryEnum = pgEnum("category", [
  "fruits",
  "vegetables",
  "dairy",
  "meat",
  "grains",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "completed",
  "cancelled",
  "shipped",
]);

export const Users = pgTable("users", {
  user_id: uuid("user_id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  role: roleEnum("role"),
  verifyCode: varchar("verifyCode", { length: 255 }),
  verifyCodeExpiry: timestamp("verifyCodeExpiry"),
  isVerified: boolean("isVerified").default(false),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const Farmers = pgTable("farmers", {
  farmer_id: uuid("farmer_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => Users.user_id),
  farm_name: varchar("farm_name", { length: 255 }),
  farm_location: varchar("farm_location", { length: 255 }),
  contact_number: varchar("contact_number", { length: 20 }),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const Products = pgTable("products", {
  product_id: uuid("product_id").primaryKey().defaultRandom(),
  farmer_id: uuid("farmer_id").references(() => Farmers.farmer_id),
  name: varchar("name", { length: 255 }),
  category: categoryEnum("category"),
  description: varchar("description", { length: 1000 }),
  price: integer("price"),
  quantity_available: integer("quantity_available"),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const Carts = pgTable("carts", {
  cart_id: uuid("cart_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => Users.user_id),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const CartItems = pgTable("cart_items", {
  cart_item_id: uuid("cart_item_id").primaryKey().defaultRandom(),
  cart_id: uuid("cart_id").references(() => Carts.cart_id),
  product_id: uuid("product_id").references(() => Products.product_id),
  quantity: integer("quantity"),
  price: integer("price"),
});

export const Orders = pgTable("orders", {
  order_id: uuid("order_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => Users.user_id),
  total_price: integer("total_price"),
  status: orderStatusEnum("status"),
  shipping_address: varchar("shipping_address", { length: 255 }),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const OrderItems = pgTable("order_items", {
  order_item_id: uuid("order_item_id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").references(() => Orders.order_id),
  product_id: uuid("product_id").references(() => Products.product_id),
  quantity: integer("quantity"),
  price: integer("price"),
});

export const ProductReviews = pgTable("product_reviews", {
  review_id: uuid("review_id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => Products.product_id),
  user_id: uuid("user_id").references(() => Users.user_id),
  rating: integer("rating"),
  comment: varchar("comment", { length: 1000 }),
  created_at: timestamp("created_at"),
});

// Relations
export const UsersRelations = relations(Users, ({ one, many }) => ({
  farmer: one(Farmers, {
    fields: [Users.user_id],
    references: [Farmers.user_id],
  }),
  carts: many(Carts),
  orders: many(Orders),
  productReviews: many(ProductReviews),
}));

export const FarmersRelations = relations(Farmers, ({ one, many }) => ({
  user: one(Users, {
    fields: [Farmers.user_id],
    references: [Users.user_id],
  }),
  products: many(Products),
}));

export const ProductsRelations = relations(Products, ({ one, many }) => ({
  farmer: one(Farmers, {
    fields: [Products.farmer_id],
    references: [Farmers.farmer_id],
  }),
  cartItems: many(CartItems),
  orderItems: many(OrderItems),
  reviews: many(ProductReviews),
}));

export const CartsRelations = relations(Carts, ({ one, many }) => ({
  user: one(Users, {
    fields: [Carts.user_id],
    references: [Users.user_id],
  }),
  cartItems: many(CartItems),
}));

export const CartItemsRelations = relations(CartItems, ({ one }) => ({
  cart: one(Carts, {
    fields: [CartItems.cart_id],
    references: [Carts.cart_id],
  }),
  product: one(Products, {
    fields: [CartItems.product_id],
    references: [Products.product_id],
  }),
}));

export const OrdersRelations = relations(Orders, ({ one, many }) => ({
  user: one(Users, {
    fields: [Orders.user_id],
    references: [Users.user_id],
  }),
  orderItems: many(OrderItems),
}));

export const OrderItemsRelations = relations(OrderItems, ({ one }) => ({
  order: one(Orders, {
    fields: [OrderItems.order_id],
    references: [Orders.order_id],
  }),
  product: one(Products, {
    fields: [OrderItems.product_id],
    references: [Products.product_id],
  }),
}));

export const ProductReviewsRelations = relations(ProductReviews, ({ one }) => ({
  product: one(Products, {
    fields: [ProductReviews.product_id],
    references: [Products.product_id],
  }),
  user: one(Users, {
    fields: [ProductReviews.user_id],
    references: [Users.user_id],
  }),
}));