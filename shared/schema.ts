import { sqliteTable, text, integer, real, } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  imageUrl: text("image_url").notNull(),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  bestseller: integer("bestseller", { mode: "boolean" }).notNull().default(false),
  newLaunch: integer("new_launch", { mode: "boolean" }).notNull().default(false),
  saleOffer: text("sale_offer"),
  variants: text("variants"),
  ingredients: text("ingredients"),
  benefits: text("benefits"),
  howToUse: text("how_to_use"),
  size: text("size"),
  tags: text("tags"),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("Active"),
  productCount: integer("product_count").notNull().default(0),
});

export const subcategories = sqliteTable("subcategories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("Active"),
  productCount: integer("product_count").notNull().default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;