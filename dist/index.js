// server/index.ts
import express2 from "express";
import { config } from "dotenv";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// server/storage.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql as sql2, and, asc, desc } from "drizzle-orm";
import { Pool } from "pg";

// shared/schema.ts
import { pgTable, text, integer, numeric, boolean, serial, jsonb, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  imageUrl: text("image_url").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  bestseller: boolean("bestseller").notNull().default(false),
  newLaunch: boolean("new_launch").notNull().default(false),
  saleOffer: text("sale_offer"),
  variants: jsonb("variants"),
  ingredients: text("ingredients"),
  benefits: text("benefits"),
  howToUse: text("how_to_use"),
  size: text("size"),
  tags: text("tags")
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("Active"),
  productCount: integer("product_count").notNull().default(0)
});
var subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("Active"),
  productCount: integer("product_count").notNull().default(0)
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true
});
var insertUserSchema = createInsertSchema(users);
var selectUserSchema = createSelectSchema(users);
var ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  trackingNumber: text("tracking_number"),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertOrderSchema = createInsertSchema(ordersTable);
var selectOrderSchema = createSelectSchema(ordersTable);
var orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => ordersTable.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull(),
  quantity: integer("quantity").notNull(),
  price: text("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertOrderItemSchema = createInsertSchema(orderItemsTable);
var selectOrderItemSchema = createSelectSchema(orderItemsTable);
var orderNotificationsTable = pgTable("order_notifications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => ordersTable.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  // email, sms, push
  status: text("status").notNull(),
  // sent, failed, pending
  message: text("message").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertOrderNotificationSchema = createInsertSchema(orderNotificationsTable);
var selectOrderNotificationSchema = createSelectSchema(orderNotificationsTable);
var sliders = pgTable("sliders", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: text("subject"),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("unread").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at")
});
var shades = pgTable("shades", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  colorCode: text("color_code").notNull(),
  value: text("value").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  categoryIds: jsonb("category_ids"),
  subcategoryIds: jsonb("subcategory_ids"),
  productIds: jsonb("product_ids"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// server/storage.ts
import dotenv from "dotenv";
dotenv.config();
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var db = void 0;
async function getDb() {
  if (!db) {
    try {
      const client = await pool.connect();
      client.release();
      console.log("Database connected successfully (PostgreSQL)");
      db = drizzle(pool);
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
  return db;
}
var DatabaseStorage = class {
  db;
  constructor() {
    this.initializeDb();
  }
  async initializeDb() {
    if (!this.db) {
      try {
        this.db = drizzle(pool);
        console.log("Database connected successfully (PostgreSQL) - inside DatabaseStorage");
      } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
      }
    }
  }
  // Users
  async getUser(id) {
    const db3 = await getDb();
    const result = await db3.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const db3 = await getDb();
    const result = await db3.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(userData) {
    const db3 = await getDb();
    const result = await db3.insert(users).values(userData).returning();
    return result[0];
  }
  async updateUser(id, userData) {
    const db3 = await getDb();
    const result = await db3.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }
  async deleteUser(id) {
    const db3 = await getDb();
    const result = await db3.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  // Products
  async getProduct(id) {
    const db3 = await getDb();
    const result = await db3.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }
  async getProductBySlug(slug) {
    const db3 = await getDb();
    const result = await db3.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result[0];
  }
  async getProducts() {
    const db3 = await getDb();
    return await db3.select().from(products);
  }
  async getProductsByCategory(category) {
    const db3 = await getDb();
    let result = await db3.select().from(products).where(eq(products.category, category));
    if (result.length === 0) {
      const allProducts = await db3.select().from(products);
      const searchCategory = category.toLowerCase();
      result = allProducts.filter((product) => {
        if (!product.category) return false;
        const productCategory = product.category.toLowerCase();
        if (productCategory.includes(searchCategory) || searchCategory.includes(productCategory)) return true;
        const categoryMappings = {
          "skincare": ["skin", "face", "facial"],
          "haircare": ["hair"],
          "makeup": ["cosmetics", "beauty"],
          "bodycare": ["body"],
          "eyecare": ["eye", "eyes"],
          "eye-drama": ["eye", "eyes", "eyecare"],
          "beauty": ["makeup", "cosmetics", "skincare"]
        };
        const mappedCategories = categoryMappings[searchCategory] || [];
        return mappedCategories.some((mapped) => productCategory.includes(mapped));
      });
    }
    return result;
  }
  async getFeaturedProducts() {
    const db3 = await getDb();
    return await db3.select().from(products).where(eq(products.featured, true));
  }
  async getBestsellerProducts() {
    const db3 = await getDb();
    return await db3.select().from(products).where(eq(products.bestseller, true));
  }
  async getNewLaunchProducts() {
    const db3 = await getDb();
    return await db3.select().from(products).where(eq(products.newLaunch, true));
  }
  async createProduct(productData) {
    const db3 = await getDb();
    console.log("Creating product with data:", productData);
    const { name, price, category, description } = productData;
    if (!name || !price || !category || !description) {
      throw new Error("Missing required fields: name, price, category, and description are required");
    }
    const slug = productData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const productToInsert = {
      name: String(name).trim(),
      slug,
      description: String(description).trim(),
      shortDescription: productData.shortDescription ? String(productData.shortDescription).trim() : description.slice(0, 100),
      price: Number(price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      category: String(category).trim(),
      subcategory: productData.subcategory ? String(productData.subcategory).trim() : null,
      imageUrl: productData.imageUrl ? String(productData.imageUrl).trim() : "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      rating: Number(productData.rating) || 4,
      reviewCount: Number(productData.reviewCount) || 0,
      inStock: Boolean(productData.inStock ?? true),
      featured: Boolean(productData.featured ?? false),
      bestseller: Boolean(productData.bestseller ?? false),
      newLaunch: Boolean(productData.newLaunch ?? false),
      saleOffer: productData.saleOffer ? String(productData.saleOffer).trim() : null,
      variants: productData.variants ? String(productData.variants).trim() : null,
      ingredients: productData.ingredients ? String(productData.ingredients).trim() : null,
      benefits: productData.benefits ? String(productData.benefits).trim() : null,
      howToUse: productData.howToUse ? String(productData.howToUse).trim() : null,
      size: productData.size ? String(productData.size).trim() : null,
      tags: productData.tags ? String(productData.tags).trim() : null
    };
    console.log("Inserting product:", productToInsert);
    try {
      console.log("Inserting product data:", productToInsert);
      const result = await db3.insert(products).values(productToInsert).returning();
      if (!result || result.length === 0) {
        throw new Error("Product was not created - no result returned");
      }
      console.log("Product created successfully:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Error creating product:", error);
      console.error("Product data that failed:", productToInsert);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }
  async updateProduct(id, productData) {
    try {
      const db3 = await getDb();
      const cleanData = { ...productData };
      if (cleanData.price !== void 0) {
        cleanData.price = parseFloat(cleanData.price) || 0;
      }
      if (cleanData.rating !== void 0) {
        cleanData.rating = parseFloat(cleanData.rating) || 0;
      }
      if (cleanData.reviewCount !== void 0) {
        cleanData.reviewCount = parseInt(cleanData.reviewCount) || 0;
      }
      const stringFields = ["subcategory", "saleOffer", "size", "ingredients", "benefits", "howToUse", "tags"];
      stringFields.forEach((field) => {
        if (cleanData[field] === "") {
          cleanData[field] = null;
        }
      });
      if (cleanData.name) {
        cleanData.slug = cleanData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      const [updatedProduct] = await db3.update(products).set(cleanData).where(eq(products.id, id)).returning();
      return updatedProduct || null;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }
  async deleteProduct(id) {
    const db3 = await getDb();
    const result = await db3.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }
  // Categories
  async getCategory(id) {
    const db3 = await getDb();
    const result = await db3.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }
  async getCategoryBySlug(slug) {
    const db3 = await getDb();
    const result = await db3.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }
  async getCategories() {
    const db3 = await getDb();
    return await db3.select().from(categories);
  }
  async createCategory(category) {
    try {
      const db3 = await getDb();
      console.log("Creating category with data:", category);
      if (!category.name || !category.description || !category.slug) {
        throw new Error("Missing required fields: name, description, and slug are required");
      }
      const existingCategory = await db3.select().from(categories).where(eq(categories.slug, category.slug)).limit(1);
      if (existingCategory.length > 0) {
        throw new Error(`Category with slug '${category.slug}' already exists`);
      }
      const result = await db3.insert(categories).values(category).returning();
      if (!result || result.length === 0) {
        throw new Error("Failed to insert category into database");
      }
      console.log("Category created successfully:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.message.includes("unique constraint")) {
        throw new Error("A category with this name or slug already exists");
      } else if (error.message.includes("not null constraint")) {
        throw new Error("Missing required category information");
      } else {
        throw new Error(error.message || "Failed to create category");
      }
    }
  }
  async updateCategory(id, category) {
    const db3 = await getDb();
    const result = await db3.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }
  async deleteCategory(id) {
    const db3 = await getDb();
    const result = await db3.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }
  // Subcategories
  async getSubcategory(id) {
    const db3 = await getDb();
    const result = await db3.select().from(subcategories).where(eq(subcategories.id, id)).limit(1);
    return result[0];
  }
  async getSubcategoryBySlug(slug) {
    const db3 = await getDb();
    const result = await db3.select().from(subcategories).where(eq(subcategories.slug, slug)).limit(1);
    return result[0];
  }
  async getSubcategories() {
    const db3 = await getDb();
    return await db3.select().from(subcategories);
  }
  async getSubcategoriesByCategory(categoryId) {
    const db3 = await getDb();
    return await db3.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));
  }
  async createSubcategory(subcategory) {
    const db3 = await getDb();
    const result = await db3.insert(subcategories).values(subcategory).returning();
    return result[0];
  }
  async updateSubcategory(id, subcategory) {
    const db3 = await getDb();
    const result = await db3.update(subcategories).set(subcategory).where(eq(subcategories.id, id)).returning();
    return result[0];
  }
  async deleteSubcategory(id) {
    const db3 = await getDb();
    const result = await db3.delete(subcategories).where(eq(subcategories.id, id)).returning();
    return result.length > 0;
  }
  async searchProducts(query) {
    const db3 = await getDb();
    const searchTerm = `%${query.toLowerCase()}%`;
    const result = await db3.select().from(products).where(
      sql2`LOWER(${products.name}) LIKE ${searchTerm} 
          OR LOWER(${products.category}) LIKE ${searchTerm} 
          OR LOWER(${products.subcategory}) LIKE ${searchTerm}
          OR LOWER(${products.tags}) LIKE ${searchTerm}`
    ).limit(10);
    return result;
  }
  async getUserById(id) {
    const db3 = await getDb();
    const result = await db3.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async updateUserPassword(id, hashedPassword) {
    const db3 = await getDb();
    const result = await db3.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  async createContactSubmission(submissionData) {
    const db3 = await getDb();
    const contactData = {
      firstName: submissionData.firstName,
      lastName: submissionData.lastName,
      email: submissionData.email,
      phone: submissionData.phone || null,
      subject: submissionData.subject || null,
      message: submissionData.message,
      status: submissionData.status || "unread"
    };
    const result = await db3.insert(contactSubmissions).values(contactData).returning();
    return result[0];
  }
  async getContactSubmissions() {
    const db3 = await getDb();
    const result = await db3.select().from(contactSubmissions).orderBy(sql2`${contactSubmissions.createdAt} DESC`);
    return result;
  }
  async getContactSubmission(id) {
    const db3 = await getDb();
    const result = await db3.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1);
    return result[0] || null;
  }
  async updateContactSubmissionStatus(id, status, respondedAt) {
    const db3 = await getDb();
    const updateData = { status };
    if (respondedAt) {
      updateData.respondedAt = respondedAt;
    }
    const result = await db3.update(contactSubmissions).set(updateData).where(eq(contactSubmissions.id, id)).returning();
    return result[0] || null;
  }
  async deleteContactSubmission(id) {
    const db3 = await getDb();
    const result = await db3.delete(contactSubmissions).where(eq(contactSubmissions.id, id)).returning();
    return result.length > 0;
  }
  // Shades - Consolidated methods (removed duplicates)
  async getShade(id) {
    const db3 = await getDb();
    const result = await db3.select().from(shades).where(eq(shades.id, id)).limit(1);
    return result[0];
  }
  async getShades() {
    try {
      const db3 = await getDb();
      const result = await db3.select().from(shades).orderBy(asc(shades.sortOrder));
      return result;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
  async getActiveShades() {
    try {
      const db3 = await getDb();
      const result = await db3.select().from(shades).where(eq(shades.isActive, true)).orderBy(asc(shades.sortOrder));
      return result;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
  async getShadesByCategory(categoryId) {
    const db3 = await getDb();
    return await db3.select().from(shades).where(and(
      eq(shades.isActive, true),
      sql2`json_extract(${shades.categoryIds}, '$') LIKE '%${categoryId}%'`
    )).orderBy(shades.sortOrder);
  }
  async getShadesBySubcategory(subcategoryId) {
    const db3 = await getDb();
    return await db3.select().from(shades).where(and(
      eq(shades.isActive, true),
      sql2`json_extract(${shades.subcategoryIds}, '$') LIKE '%${subcategoryId}%'`
    )).orderBy(shades.sortOrder);
  }
  async createShade(shadeData) {
    try {
      const db3 = await getDb();
      const [shade] = await db3.insert(shades).values(shadeData).returning();
      return shade;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
  async updateShade(id, shadeData) {
    try {
      const db3 = await getDb();
      const updateData = {
        ...shadeData,
        updatedAt: /* @__PURE__ */ new Date()
      };
      console.log("Updating shade in database:", { id, updateData });
      const result = await db3.update(shades).set(updateData).where(eq(shades.id, id)).returning();
      if (!result || result.length === 0) {
        console.log("No shade found with ID:", id);
        return void 0;
      }
      console.log("Shade updated successfully in database:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Database error updating shade:", error);
      throw error;
    }
  }
  async deleteShade(id) {
    try {
      const db3 = await getDb();
      const result = await db3.delete(shades).where(eq(shades.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
  // Get shades for a specific product based on its category/subcategory or individual assignment
  async getProductShades(productId) {
    try {
      const db3 = await getDb();
      const product = await this.getProduct(productId);
      if (!product) return [];
      const allShades = await this.getActiveShades();
      const allCategories = await this.getCategories();
      const allSubcategories = await this.getSubcategories();
      const productShades = allShades.filter((shade) => {
        if (shade.productIds && Array.isArray(shade.productIds)) {
          if (shade.productIds.includes(productId)) return true;
        }
        if (shade.categoryIds && Array.isArray(shade.categoryIds)) {
          const hasMatchingCategory = shade.categoryIds.some((catId) => {
            const category = allCategories.find((cat) => cat.id === catId);
            return category && category.name.toLowerCase() === product.category.toLowerCase();
          });
          if (hasMatchingCategory) return true;
        }
        if (shade.subcategoryIds && Array.isArray(shade.subcategoryIds) && product.subcategory) {
          const hasMatchingSubcategory = shade.subcategoryIds.some((subId) => {
            const subcategory = allSubcategories.find((sub) => sub.id === subId);
            return subcategory && subcategory.name.toLowerCase() === product.subcategory.toLowerCase();
          });
          if (hasMatchingSubcategory) return true;
        }
        return false;
      });
      return productShades;
    } catch (error) {
      console.error("Error getting product shades:", error);
      return [];
    }
  }
  // Helper function to check if shade has references
  async checkShadeReferences(shadeId) {
    return false;
  }
  // Review Management Functions
  async createReview(reviewData) {
    const db3 = await getDb();
    const [review] = await db3.insert(reviews).values(reviewData).returning();
    console.log("Review created:", review);
    return review;
  }
  async getProductReviews(productId) {
    const db3 = await getDb();
    const productReviews = await db3.select({
      id: reviews.id,
      userId: reviews.userId,
      productId: reviews.productId,
      orderId: reviews.orderId,
      rating: reviews.rating,
      reviewText: reviews.reviewText,
      imageUrl: reviews.imageUrl,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      userName: sql2`${users.firstName} || ' ' || ${users.lastName}`,
      userEmail: users.email
    }).from(reviews).innerJoin(users, eq(reviews.userId, users.id)).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
    return productReviews;
  }
  async getUserReviews(userId) {
    const db3 = await getDb();
    const userReviews = await db3.select({
      id: reviews.id,
      userId: reviews.userId,
      productId: reviews.productId,
      orderId: reviews.orderId,
      rating: reviews.rating,
      reviewText: reviews.reviewText,
      imageUrl: reviews.imageUrl,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      productName: products.name,
      productImage: products.imageUrl
    }).from(reviews).innerJoin(products, eq(reviews.productId, products.id)).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
    return userReviews;
  }
  async checkUserCanReview(userId, productId) {
    const db3 = await getDb();
    const userOrders = await db3.select({
      orderId: ordersTable.id,
      orderStatus: ordersTable.status
    }).from(ordersTable).innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId)).where(
      and(
        eq(ordersTable.userId, userId),
        eq(orderItemsTable.productId, productId),
        eq(ordersTable.status, "delivered")
      )
    );
    if (userOrders.length === 0) {
      return {
        canReview: false,
        message: "You can only review products that you have purchased and received."
      };
    }
    const existingReview = await db3.select().from(reviews).where(
      and(
        eq(reviews.userId, userId),
        eq(reviews.productId, productId)
      )
    ).limit(1);
    if (existingReview.length > 0) {
      return {
        canReview: false,
        message: "You have already reviewed this product."
      };
    }
    return {
      canReview: true,
      orderId: userOrders[0].orderId,
      message: "You can review this product."
    };
  }
  async deleteReview(reviewId, userId) {
    const db3 = await getDb();
    const result = await db3.delete(reviews).where(
      and(
        eq(reviews.id, reviewId),
        eq(reviews.userId, userId)
      )
    ).returning();
    return result.length > 0;
  }
};
var storage = new DatabaseStorage();

// server/otp-service.ts
import crypto from "crypto";
import nodemailer from "nodemailer";
var otpStorage = /* @__PURE__ */ new Map();
var OTPService = class {
  // Expose storage for development endpoint access
  static get otpStorage() {
    return otpStorage;
  }
  // Mobile OTP methods
  static async sendMobileOTP(phoneNumber) {
    try {
      const cleanedPhone = phoneNumber.replace(/\D/g, "");
      const formattedPhone = cleanedPhone.startsWith("91") && cleanedPhone.length === 12 ? cleanedPhone.substring(2) : cleanedPhone;
      if (formattedPhone.length !== 10) {
        return {
          success: false,
          message: "Please enter a valid 10-digit mobile number"
        };
      }
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
      otpStorage.set(formattedPhone, {
        otp,
        email: formattedPhone,
        // Using email field for phone number
        expiresAt,
        verified: false
      });
      console.log("\n" + "=".repeat(50));
      console.log("\u{1F4F1} MOBILE OTP SENT");
      console.log("=".repeat(50));
      console.log(`\u{1F4F1} Phone: +91 ${formattedPhone}`);
      console.log(`\u{1F510} OTP Code: ${otp}`);
      console.log(`\u23F0 Valid for: 5 minutes`);
      console.log(`\u{1F4C5} Generated at: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
      console.log("=".repeat(50) + "\n");
      return {
        success: true,
        message: "OTP sent to your mobile number successfully"
      };
    } catch (error) {
      console.error("Error sending mobile OTP:", error);
      return {
        success: false,
        message: "Failed to send mobile OTP"
      };
    }
  }
  static async verifyMobileOTP(phoneNumber, otp) {
    try {
      const cleanedPhone = phoneNumber.replace(/\D/g, "");
      const formattedPhone = cleanedPhone.startsWith("91") && cleanedPhone.length === 12 ? cleanedPhone.substring(2) : cleanedPhone;
      const otpData = otpStorage.get(formattedPhone);
      if (!otpData) {
        return {
          success: false,
          message: "OTP not found or expired"
        };
      }
      if (/* @__PURE__ */ new Date() > otpData.expiresAt) {
        otpStorage.delete(formattedPhone);
        return {
          success: false,
          message: "OTP has expired"
        };
      }
      if (otpData.otp !== otp) {
        return {
          success: false,
          message: "Invalid OTP"
        };
      }
      otpData.verified = true;
      otpStorage.set(formattedPhone, otpData);
      return {
        success: true,
        message: "Mobile OTP verified successfully"
      };
    } catch (error) {
      console.error("Error verifying mobile OTP:", error);
      return {
        success: false,
        message: "Failed to verify mobile OTP"
      };
    }
  }
  // Create email transporter
  static createTransporter() {
    const config2 = {
      service: "gmail",
      // Use Gmail service instead of manual SMTP config
      auth: {
        user: process.env.EMAIL_USER?.replace(/"/g, "").trim(),
        pass: process.env.EMAIL_PASS?.replace(/"/g, "").trim()
      },
      tls: {
        rejectUnauthorized: false
      }
    };
    console.log("\u{1F4E7} Email transporter config:", {
      service: "gmail",
      user: config2.auth.user,
      passLength: config2.auth.pass?.length || 0,
      passPreview: config2.auth.pass ? `${config2.auth.pass.substring(0, 4)}****` : "undefined"
    });
    return nodemailer.createTransporter(config2);
  }
  static generateOTP() {
    if (process.env.STATIC_OTP === "true") {
      return "123456";
    }
    return crypto.randomInt(1e5, 999999).toString();
  }
  static async sendOTP(email) {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
      otpStorage.set(email, {
        otp,
        email,
        expiresAt,
        verified: false
      });
      const emailSent = await this.sendEmail(email, otp);
      if (!emailSent) {
        console.error("Failed to send OTP email");
        return {
          success: false,
          message: "Failed to send OTP email"
        };
      }
      return {
        success: true,
        message: "OTP sent to your email successfully"
      };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        message: "Failed to send OTP"
      };
    }
  }
  static async verifyOTP(email, otp) {
    const otpData = otpStorage.get(email);
    if (!otpData) {
      return {
        success: false,
        message: "OTP not found or expired"
      };
    }
    if (/* @__PURE__ */ new Date() > otpData.expiresAt) {
      otpStorage.delete(email);
      return {
        success: false,
        message: "OTP has expired"
      };
    }
    if (otpData.otp !== otp) {
      return {
        success: false,
        message: "Invalid OTP"
      };
    }
    otpData.verified = true;
    otpStorage.set(email, otpData);
    return {
      success: true,
      message: "OTP verified successfully"
    };
  }
  static isVerified(email) {
    const otpData = otpStorage.get(email);
    return otpData?.verified === true;
  }
  static clearOTP(email) {
    otpStorage.delete(email);
  }
  // Email-based OTP system using Nodemailer
  static async sendEmail(email, otp) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("\u26A0\uFE0F  Email configuration missing - using console output only");
        console.log("\n" + "=".repeat(50));
        console.log("\u{1F4E7} EMAIL OTP (Console Only)");
        console.log("=".repeat(50));
        console.log(`\u{1F4E7} Email: ${email}`);
        console.log(`\u{1F510} OTP Code: ${otp}`);
        console.log(`\u23F0 Valid for: 5 minutes`);
        console.log(`\u{1F4C5} Generated at: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
        console.log("=".repeat(50) + "\n");
        return true;
      }
      const transporter = this.createTransporter();
      console.log("\u{1F50D} Verifying email connection...");
      await transporter.verify();
      console.log("\u2705 Email connection verified successfully");
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code - Beauty Store",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Beauty Store</h1>
              <p style="color: white; margin: 5px 0; opacity: 0.9;">Your OTP Verification Code</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                You requested an OTP for verification. Please use the code below to complete your action:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #e74c3c; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 8px; display: inline-block;">
                  ${otp}
                </div>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>\u23F0 Important:</strong> This OTP is valid for 5 minutes only.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                If you didn't request this OTP, please ignore this email. For security reasons, please do not share this code with anyone.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <div style="text-align: center; color: #999; font-size: 12px;">
                <p>Beauty Store - Premium Beauty & Skincare Products</p>
                <p>Generated at: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              </div>
            </div>
          </div>
        `,
        text: `
Your OTP Code: ${otp}

This code is valid for 5 minutes only.
Generated at: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}

Beauty Store - Premium Beauty & Skincare Products
        `
      };
      await transporter.sendMail(mailOptions);
      console.log("\n" + "=".repeat(50));
      console.log("\u{1F4E7} EMAIL OTP SENT");
      console.log("=".repeat(50));
      console.log(`\u{1F4E7} Email: ${email}`);
      console.log(`\u{1F510} OTP Code: ${otp}`);
      console.log(`\u23F0 Valid for: 5 minutes`);
      console.log(`\u{1F4C5} Generated at: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
      console.log("=".repeat(50) + "\n");
      return true;
    } catch (error) {
      console.error("\u{1F4E7} Email sending failed with detailed error:");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Response code:", error.responseCode);
      console.error("Command:", error.command);
      console.error("Full error:", error);
      console.log("\n" + "=".repeat(50));
      console.log("\u{1F4E7} EMAIL OTP (Fallback - Console Output)");
      console.log("=".repeat(50));
      console.log(`\u{1F4E7} Email: ${email}`);
      console.log(`\u{1F510} OTP Code: ${otp}`);
      console.log(`\u23F0 Valid for: 5 minutes`);
      console.log(`\u{1F4C5} Generated at: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
      console.log("=".repeat(50) + "\n");
      return true;
    }
  }
};

// server/routes.ts
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { eq as eq2, desc as desc2, asc as asc2 } from "drizzle-orm";
import { Pool as Pool2 } from "pg";
var pool2 = new Pool2({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/my_pgdb"
});
var db2 = drizzle2(pool2);
var PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "paypal_client_id";
var PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "paypal_client_secret";
var PAYPAL_BASE_URL = process.env.NODE_ENV === "production" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com";
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const timestamp2 = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `${timestamp2}-${Math.random().toString(36).substring(7)}${extension}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      message: "API server is running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/api/sliders", async (req, res) => {
    try {
      const activeSliders = await db2.select().from(sliders).where(eq2(sliders.isActive, true)).orderBy(asc2(sliders.sortOrder));
      res.json(activeSliders);
    } catch (error) {
      console.error("Error fetching public sliders:", error);
      console.log("Database unavailable, using sample slider data");
    }
  });
  const verifyFirebaseToken = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No Firebase token provided" });
      }
      const token = authHeader.substring(7);
      console.log("Firebase token received:", token.substring(0, 20) + "...");
      req.firebaseUser = { token };
      next();
    } catch (error) {
      console.error("Firebase token verification error:", error);
      res.status(401).json({ error: "Invalid Firebase token" });
    }
  };
  app2.post("/api/auth/firebase", verifyFirebaseToken, async (req, res) => {
    try {
      const { uid, email, displayName, phoneNumber, photoURL } = req.body;
      let user = await storage.getUserByEmail(email || `${uid}@firebase.user`);
      if (!user) {
        user = await storage.createUser({
          firstName: displayName ? displayName.split(" ")[0] : "Firebase",
          lastName: displayName ? displayName.split(" ").slice(1).join(" ") || "User" : "User",
          email: email || `${uid}@firebase.user`,
          phone: phoneNumber || null,
          password: "firebase_auth",
          // Placeholder since Firebase handles auth
          firebaseUid: uid
        });
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: "Firebase authentication successful",
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Firebase auth error:", error);
      res.status(500).json({ error: "Failed to authenticate with Firebase" });
    }
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All required fields must be provided" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords don't match" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword
      });
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });
  app2.post("/api/auth/send-mobile-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
        return res.status(400).json({ error: "Please enter a valid Indian mobile number" });
      }
      const result = await OTPService.sendMobileOTP(phoneNumber);
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      console.error("Send mobile OTP error:", error);
      res.status(500).json({ error: "Failed to send mobile OTP" });
    }
  });
  app2.post("/api/auth/verify-mobile-otp", async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      if (!phoneNumber || !otp) {
        return res.status(400).json({ error: "Phone number and OTP are required" });
      }
      if (otp.length !== 6) {
        return res.status(400).json({ error: "Please enter valid 6-digit OTP" });
      }
      const result = await OTPService.verifyMobileOTP(phoneNumber, otp);
      if (result.success) {
        res.json({
          verified: true,
          message: result.message
        });
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error("Verify mobile OTP error:", error);
      res.status(500).json({ error: "Failed to verify mobile OTP" });
    }
  });
  app2.get("/api/auth/get-mobile-otp/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const otpData = OTPService.otpStorage.get(phoneNumber);
      if (otpData && /* @__PURE__ */ new Date() <= otpData.expiresAt) {
        res.json({ otp: otpData.otp });
      } else {
        res.status(404).json({ error: "No valid OTP found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get OTP" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      console.log(`PUT /api/users/${req.params.id} - Request received`);
      console.log("Request body:", req.body);
      console.log("Request headers:", req.headers);
      res.setHeader("Content-Type", "application/json");
      const { id } = req.params;
      const { firstName, lastName, phone } = req.body;
      console.log(`Updating user ${id} with:`, { firstName, lastName, phone });
      if (!firstName || !lastName) {
        return res.status(400).json({ error: "First name and last name are required" });
      }
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const updatedUser = await storage.updateUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : null
      });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log("User updated successfully:", updatedUser);
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({
        message: "Profile updated successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile", details: error.message });
    }
  });
  app2.put("/api/users/:id/password", async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }
      const user = await storage.getUserById(parseInt(id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(parseInt(id), hashedNewPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.use("/api/images", (req, res, next) => {
    const imagePath = path.join(uploadsDir, req.path);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image not found" });
    }
    const extension = path.extname(imagePath).toLowerCase();
    const contentType = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp"
    }[extension] || "image/jpeg";
    res.set("Content-Type", contentType);
    res.sendFile(imagePath);
  });
  app2.post("/api/upload/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const imageUrl = `/api/images/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  app2.post("/api/admin/upload-image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const imageUrl = `/api/images/${req.file.filename}`;
      res.json({
        success: true,
        imageUrl,
        message: "Image uploaded successfully"
      });
    } catch (error) {
      console.error("Admin image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      console.log("Database unavailable, using sample product data");
      res.json(generateSampleProducts());
    }
  });
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const products2 = await storage.getFeaturedProducts();
      res.json(products2);
    } catch (error) {
      console.log("Database unavailable, using sample featured products");
      const sampleProducts = generateSampleProducts();
      res.json(sampleProducts.filter((p) => p.featured));
    }
  });
  app2.get("/api/products/bestsellers", async (req, res) => {
    try {
      const products2 = await storage.getBestsellerProducts();
      res.json(products2);
    } catch (error) {
      console.log("Database unavailable, using sample bestseller products");
      const sampleProducts = generateSampleProducts();
      res.json(sampleProducts.filter((p) => p.bestseller));
    }
  });
  app2.get("/api/products/new-launches", async (req, res) => {
    try {
      const products2 = await storage.getNewLaunchProducts();
      res.json(products2);
    } catch (error) {
      console.log("Database unavailable, using sample new launch products");
      const sampleProducts = generateSampleProducts();
      res.json(sampleProducts.filter((p) => p.newLaunch));
    }
  });
  app2.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const allProducts = await storage.getProducts();
      const filteredProducts = allProducts.filter((product) => {
        if (!product.category) return false;
        const productCategory = product.category.toLowerCase();
        const searchCategory = category.toLowerCase();
        if (productCategory === searchCategory) return true;
        if (productCategory.includes(searchCategory) || searchCategory.includes(productCategory)) return true;
        const categoryMappings = {
          "skincare": ["skin", "face", "facial"],
          "haircare": ["hair"],
          "makeup": ["cosmetics", "beauty"],
          "bodycare": ["body"],
          "eyecare": ["eye", "eyes"],
          "eye-drama": ["eye", "eyes", "eyecare"],
          "beauty": ["makeup", "cosmetics", "skincare"]
        };
        const mappedCategories = categoryMappings[searchCategory] || [];
        return mappedCategories.some((mapped) => productCategory.includes(mapped));
      });
      res.json(filteredProducts);
    } catch (error) {
      console.log("Database unavailable, using sample product data with category filter");
      const sampleProducts = generateSampleProducts();
      const { category } = req.params;
      const searchCategory = category.toLowerCase();
      const filteredSampleProducts = sampleProducts.filter((product) => {
        const productCategory = product.category.toLowerCase();
        return productCategory.includes(searchCategory) || searchCategory.includes(productCategory) || searchCategory.includes("eye") && productCategory.includes("makeup") || searchCategory.includes("beauty") && ["skincare", "makeup"].some((cat) => productCategory.includes(cat));
      });
      res.json(filteredSampleProducts);
    }
  });
  app2.get("/api/products/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      const categoriesWithCount = await Promise.all(
        categories2.map(async (category) => {
          const products2 = await storage.getProductsByCategory(category.name);
          return {
            ...category,
            productCount: products2.length
          };
        })
      );
      res.json(categoriesWithCount);
    } catch (error) {
      console.log("Database unavailable, using sample category data");
      res.json(generateSampleCategories());
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      console.log("Received product data:", req.body);
      res.setHeader("Content-Type", "application/json");
      const { name, price, category, description } = req.body;
      if (!name || !price || !category || !description) {
        return res.status(400).json({
          error: "Missing required fields: name, price, category, and description are required"
        });
      }
      const product = await storage.createProduct(req.body);
      console.log("Product created successfully:", product);
      res.status(201).json(product);
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(500).json({
        error: "Failed to create product",
        details: error.message || "Unknown error"
      });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Updating product ${id} with data:`, req.body);
      const product = await storage.updateProduct(parseInt(id), req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Product update error:", error);
      res.status(500).json({
        error: "Failed to update product",
        details: error.message
      });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app2.post("/api/categories", async (req, res) => {
    try {
      console.log("Received category data:", req.body);
      res.setHeader("Content-Type", "application/json");
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({
          error: "Missing required fields: name and description are required"
        });
      }
      if (name.trim().length === 0 || description.trim().length === 0) {
        return res.status(400).json({
          error: "Name and description cannot be empty"
        });
      }
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const imageUrl = req.body.imageUrl || "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400";
      const categoryData = {
        name: name.trim(),
        slug,
        description: description.trim(),
        imageUrl,
        status: req.body.status || "Active",
        productCount: parseInt(req.body.productCount) || 0
      };
      console.log("Creating category with processed data:", categoryData);
      const category = await storage.createCategory(categoryData);
      console.log("Category created successfully:", category);
      res.status(201).json(category);
    } catch (error) {
      console.error("Category creation error:", error);
      res.status(500).json({
        error: "Failed to create category",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : void 0
      });
    }
  });
  app2.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateCategory(parseInt(id), req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });
  app2.get("/api/subcategories", async (req, res) => {
    try {
      const subcategories2 = await storage.getSubcategories();
      res.json(subcategories2);
    } catch (error) {
      console.log("Database unavailable, using sample subcategory data");
      res.json(generateSampleSubcategories());
    }
  });
  app2.get("/api/subcategories/category/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const subcategories2 = await storage.getSubcategoriesByCategory(parseInt(categoryId));
      res.json(subcategories2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcategories" });
    }
  });
  app2.get("/api/subcategories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const subcategory = await storage.getSubcategoryBySlug(slug);
      if (!subcategory) {
        return res.status(404).json({ error: "Subcategory not found" });
      }
      res.json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcategory" });
    }
  });
  app2.post("/api/subcategories", async (req, res) => {
    try {
      const subcategory = await storage.createSubcategory(req.body);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to create subcategory" });
    }
  });
  app2.put("/api/subcategories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const subcategory = await storage.updateSubcategory(parseInt(id), req.body);
      if (!subcategory) {
        return res.status(404).json({ error: "Subcategory not found" });
      }
      res.json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subcategory" });
    }
  });
  app2.delete("/api/subcategories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSubcategory(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Subcategory not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subcategory" });
    }
  });
  app2.get("/api/admin/orders", async (req, res) => {
    try {
      let orders;
      try {
        orders = await db2.select().from(ordersTable).orderBy(desc2(ordersTable.createdAt));
      } catch (dbError) {
        console.log("Database unavailable, using sample data");
        const sampleOrders = generateSampleOrders();
        return res.json(sampleOrders);
      }
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const items = await db2.select({
            id: orderItemsTable.id,
            name: orderItemsTable.productName,
            quantity: orderItemsTable.quantity,
            price: orderItemsTable.price,
            image: orderItemsTable.productImage
          }).from(orderItemsTable).where(eq2(orderItemsTable.orderId, order.id));
          const user = await db2.select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone
          }).from(users).where(eq2(users.id, order.userId)).limit(1);
          const userData = user[0] || { firstName: "Unknown", lastName: "Customer", email: "unknown@email.com", phone: "N/A" };
          return {
            id: `ORD-${order.id.toString().padStart(3, "0")}`,
            customer: {
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              phone: userData.phone || "N/A",
              address: order.shippingAddress
            },
            date: order.createdAt.toISOString().split("T")[0],
            total: `\u20B9${order.totalAmount}`,
            status: order.status,
            items: items.length,
            paymentMethod: order.paymentMethod,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery?.toISOString().split("T")[0],
            products: items,
            userId: order.userId,
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress
          };
        })
      );
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders/:id/notify", async (req, res) => {
    try {
      const orderId = req.params.id.replace("ORD-", "");
      const { status } = req.body;
      const order = await db2.select().from(ordersTable).where(eq2(ordersTable.id, Number(orderId))).limit(1);
      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      const user = await db2.select().from(users).where(eq2(users.id, order[0].userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log(`Sending ${status} notification to ${user[0].email} for order ORD-${orderId}`);
      const notifications = {
        pending: "Your order has been received and is being processed.",
        processing: "Your order is being prepared for shipment.",
        shipped: "Your order has been shipped and is on its way!",
        delivered: "Your order has been delivered successfully.",
        cancelled: "Your order has been cancelled."
      };
      res.json({
        message: "Notification sent successfully",
        notification: notifications[status] || "Order status updated"
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const orders = await db2.select().from(ordersTable).where(eq2(ordersTable.userId, Number(userId))).orderBy(desc2(ordersTable.createdAt));
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await db2.select({
            id: orderItemsTable.id,
            name: orderItemsTable.productName,
            quantity: orderItemsTable.quantity,
            price: orderItemsTable.price,
            image: orderItemsTable.productImage
          }).from(orderItemsTable).where(eq2(orderItemsTable.orderId, order.id));
          return {
            id: `ORD-${order.id.toString().padStart(3, "0")}`,
            date: order.createdAt.toISOString().split("T")[0],
            status: order.status,
            total: `\u20B9${order.totalAmount}`,
            items,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery?.toISOString().split("T")[0],
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            userId: order.userId
          };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = req.params.id.replace("ORD-", "");
      const order = await db2.select().from(ordersTable).where(eq2(ordersTable.id, Number(orderId))).limit(1);
      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await db2.select({
        id: orderItemsTable.id,
        name: orderItemsTable.productName,
        quantity: orderItemsTable.quantity,
        price: orderItemsTable.price,
        image: orderItemsTable.productImage
      }).from(orderItemsTable).where(eq2(orderItemsTable.orderId, order[0].id));
      const orderWithItems = {
        id: `ORD-${order[0].id.toString().padStart(3, "0")}`,
        date: order[0].createdAt.toISOString().split("T")[0],
        status: order[0].status,
        total: `\u20B9${order[0].totalAmount}`,
        items,
        trackingNumber: order[0].trackingNumber,
        estimatedDelivery: order[0].estimatedDelivery?.toISOString().split("T")[0],
        shippingAddress: order[0].shippingAddress,
        paymentMethod: order[0].paymentMethod,
        userId: order[0].userId
      };
      res.json(orderWithItems);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders/sample", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const existingOrders = await db2.select().from(ordersTable).where(eq2(ordersTable.userId, Number(userId)));
      if (existingOrders.length > 0) {
        return res.json({ message: "User already has orders", orders: existingOrders.length });
      }
      const now = /* @__PURE__ */ new Date();
      const sampleOrders = [
        {
          userId: Number(userId),
          totalAmount: 1299,
          status: "delivered",
          paymentMethod: "Credit Card",
          shippingAddress: "123 Beauty Street, Mumbai, Maharashtra 400001",
          trackingNumber: "TRK001234567",
          estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1e3),
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1e3)
        },
        {
          userId: Number(userId),
          totalAmount: 899,
          status: "shipped",
          paymentMethod: "UPI",
          shippingAddress: "456 Glow Avenue, Delhi, Delhi 110001",
          trackingNumber: "TRK001234568",
          estimatedDelivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1e3),
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1e3)
        },
        {
          userId: Number(userId),
          totalAmount: 1599,
          status: "processing",
          paymentMethod: "Net Banking",
          shippingAddress: "789 Skincare Lane, Bangalore, Karnataka 560001",
          trackingNumber: null,
          estimatedDelivery: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3),
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1e3)
        }
      ];
      const createdOrders = await db2.insert(ordersTable).values(sampleOrders).returning();
      const sampleItems = [
        // Order 1 items
        {
          orderId: createdOrders[0].id,
          productId: 1,
          productName: "Vitamin C Face Serum",
          productImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          quantity: 1,
          price: "\u20B9699"
        },
        {
          orderId: createdOrders[0].id,
          productId: 2,
          productName: "Hair Growth Serum",
          productImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          quantity: 1,
          price: "\u20B9599"
        },
        // Order 2 items
        {
          orderId: createdOrders[1].id,
          productId: 3,
          productName: "Anti-Aging Night Cream",
          productImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          quantity: 1,
          price: "\u20B9899"
        },
        // Order 3 items
        {
          orderId: createdOrders[2].id,
          productId: 4,
          productName: "Hyaluronic Acid Serum",
          productImage: "https://images.unsplash.com/photo-1598662779094-110c2bad80b5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          quantity: 2,
          price: "\u20B9799"
        }
      ];
      await db2.insert(orderItemsTable).values(sampleItems);
      res.json({ message: "Sample orders created successfully", orders: createdOrders.length });
    } catch (error) {
      console.error("Error creating sample orders:", error);
      res.status(500).json({ error: "Failed to create sample orders" });
    }
  });
  const getPayPalAccessToken = async () => {
    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
      const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("PayPal access token error:", error);
      throw new Error("Failed to get PayPal access token");
    }
  };
  app2.post("/api/payments/paypal/create-order", async (req, res) => {
    try {
      const { amount, currency = "USD", customerInfo } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_ID === "paypal_client_id" || process.env.PAYPAL_CLIENT_SECRET === "paypal_client_secret") {
        console.error("PayPal credentials not configured properly");
        return res.status(500).json({
          error: "PayPal payment is not configured. Please use Cash on Delivery instead.",
          configError: true
        });
      }
      let accessToken;
      try {
        accessToken = await getPayPalAccessToken();
      } catch (tokenError) {
        console.error("Failed to get PayPal access token:", tokenError);
        return res.status(500).json({
          error: "PayPal authentication failed. Please try again or use Cash on Delivery.",
          authError: true
        });
      }
      const orderData = {
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          description: "Beauty Store Purchase",
          shipping: {
            name: {
              full_name: customerInfo?.name || "Customer"
            },
            address: {
              address_line_1: customerInfo?.address || "",
              admin_area_2: customerInfo?.city || "",
              admin_area_1: customerInfo?.state || "",
              postal_code: customerInfo?.zipCode || "",
              country_code: "US"
            }
          }
        }],
        application_context: {
          return_url: `${req.protocol}://${req.get("host")}/api/payments/paypal/success`,
          cancel_url: `${req.protocol}://${req.get("host")}/api/payments/paypal/cancel`,
          brand_name: "Beauty Store",
          landing_page: "LOGIN",
          user_action: "PAY_NOW"
        }
      };
      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });
      const order = await response.json();
      if (!response.ok) {
        console.error("PayPal API error:", order);
        let errorMessage = "Failed to create PayPal order";
        if (order.details && order.details.length > 0) {
          errorMessage = order.details[0].description || errorMessage;
        } else if (order.message) {
          errorMessage = order.message;
        }
        return res.status(500).json({
          error: errorMessage,
          paypalError: true,
          details: order.details || []
        });
      }
      const approvalUrl = order.links?.find((link) => link.rel === "approve")?.href;
      if (!approvalUrl) {
        console.error("No approval URL found in PayPal response:", order);
        return res.status(500).json({
          error: "PayPal response missing approval URL. Please try again.",
          paypalError: true
        });
      }
      res.json({
        orderId: order.id,
        approvalUrl,
        amount: orderData.purchase_units[0].amount.value,
        currency: orderData.purchase_units[0].amount.currency_code
      });
    } catch (error) {
      console.error("PayPal order creation error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create PayPal order",
        details: error instanceof Error ? error.stack : void 0
      });
    }
  });
  app2.get("/api/payments/paypal/success", async (req, res) => {
    try {
      const { token, PayerID } = req.query;
      if (!token || !PayerID) {
        return res.redirect("/checkout?payment=failed");
      }
      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      const captureData = await response.json();
      if (response.ok && captureData.status === "COMPLETED") {
        res.redirect("/checkout?payment=success");
      } else {
        res.redirect("/checkout?payment=failed");
      }
    } catch (error) {
      console.error("PayPal capture error:", error);
      res.redirect("/checkout?payment=failed");
    }
  });
  app2.get("/api/payments/paypal/cancel", (req, res) => {
    res.redirect("/checkout?payment=cancelled");
  });
  app2.post("/api/payments/paypal/verify", async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }
      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      const orderData = await response.json();
      if (response.ok && orderData.status === "COMPLETED") {
        res.json({ verified: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    } catch (error) {
      console.error("PayPal verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      console.log("Received order data:", req.body);
      const { userId, totalAmount, status, paymentMethod, shippingAddress, items } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      if (!totalAmount || isNaN(Number(totalAmount))) {
        return res.status(400).json({ error: "Valid total amount is required" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order items are required" });
      }
      if (!shippingAddress) {
        return res.status(400).json({ error: "Shipping address is required" });
      }
      const parsedTotalAmount = Number(totalAmount);
      if (parsedTotalAmount <= 0) {
        return res.status(400).json({ error: "Total amount must be greater than 0" });
      }
      const orderData = {
        userId: Number(userId),
        totalAmount: Math.round(parsedTotalAmount),
        // Round to nearest integer for database
        status: status || "pending",
        paymentMethod: paymentMethod || "Credit Card",
        shippingAddress: shippingAddress.toString(),
        trackingNumber: null,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
        // 7 days from now
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log("Creating order with data:", orderData);
      const createdOrders = await db2.insert(ordersTable).values(orderData).returning();
      const order = createdOrders[0];
      console.log("Order created:", order);
      const orderItems = items.map((item, index) => {
        if (!item.productName && !item.name) {
          throw new Error(`Item ${index + 1} is missing product name`);
        }
        if (!item.quantity || isNaN(Number(item.quantity))) {
          throw new Error(`Item ${index + 1} has invalid quantity`);
        }
        if (!item.price) {
          throw new Error(`Item ${index + 1} is missing price`);
        }
        return {
          orderId: order.id,
          productId: Number(item.productId || item.id || 0),
          productName: item.productName || item.name,
          productImage: item.productImage || item.image || "",
          quantity: Number(item.quantity),
          price: item.price.toString()
        };
      });
      console.log("Creating order items:", orderItems);
      await db2.insert(orderItemsTable).values(orderItems);
      const orderId = `ORD-${order.id.toString().padStart(3, "0")}`;
      console.log("Order created successfully with ID:", orderId);
      res.status(201).json({
        message: "Order created successfully",
        orderId,
        order: {
          id: orderId,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/orders/create-sample-data", async (req, res) => {
    try {
      const allUsers = await db2.select().from(users);
      if (allUsers.length === 0) {
        return res.status(400).json({ error: "No users found. Please create a user account first." });
      }
      let ordersCreated = 0;
      for (const user of allUsers) {
        const existingOrders = await db2.select().from(ordersTable).where(eq2(ordersTable.userId, user.id));
        if (existingOrders.length > 0) {
          continue;
        }
        const now = /* @__PURE__ */ new Date();
        const sampleOrders = [
          {
            userId: user.id,
            totalAmount: 1299,
            status: "delivered",
            paymentMethod: "Credit Card",
            shippingAddress: `${user.firstName} ${user.lastName}, 123 Beauty Street, Mumbai, Maharashtra 400001`,
            trackingNumber: `TRK00${user.id}234567`,
            estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1e3),
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1e3)
          },
          {
            userId: user.id,
            totalAmount: 899,
            status: "shipped",
            paymentMethod: "UPI",
            shippingAddress: `${user.firstName} ${user.lastName}, 456 Glow Avenue, Delhi, Delhi 110001`,
            trackingNumber: `TRK00${user.id}234568`,
            estimatedDelivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1e3),
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1e3)
          },
          {
            userId: user.id,
            totalAmount: 1599,
            status: "processing",
            paymentMethod: "Net Banking",
            shippingAddress: `${user.firstName} ${user.lastName}, 789 Skincare Lane, Bangalore, Karnataka 560001`,
            trackingNumber: null,
            estimatedDelivery: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3),
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1e3)
          }
        ];
        const createdOrders = await db2.insert(ordersTable).values(sampleOrders).returning();
        const sampleItems = [
          // Order 1 items
          {
            orderId: createdOrders[0].id,
            productId: 1,
            productName: "Vitamin C Face Serum",
            productImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
            quantity: 1,
            price: "\u20B9699"
          },
          {
            orderId: createdOrders[0].id,
            productId: 2,
            productName: "Hair Growth Serum",
            productImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
            quantity: 1,
            price: "\u20B9599"
          },
          // Order 2 items
          {
            orderId: createdOrders[1].id,
            productId: 3,
            productName: "Anti-Aging Night Cream",
            productImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
            quantity: 1,
            price: "\u20B9899"
          },
          // Order 3 items
          {
            orderId: createdOrders[2].id,
            productId: 4,
            productName: "Hyaluronic Acid Serum",
            productImage: "https://images.unsplash.com/photo-1598662779094-110c2bad80b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
            quantity: 2,
            price: "\u20B9799"
          }
        ];
        await db2.insert(orderItemsTable).values(sampleItems);
        ordersCreated += createdOrders.length;
      }
      res.json({
        message: "Sample orders created successfully",
        ordersCreated,
        usersProcessed: allUsers.length
      });
    } catch (error) {
      console.error("Error creating sample orders:", error);
      res.status(500).json({ error: "Failed to create sample orders" });
    }
  });
  app2.put("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = req.params.id.replace("ORD-", "");
      const { status, trackingNumber } = req.body;
      const updateData = { status };
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }
      await db2.update(ordersTable).set(updateData).where(eq2(ordersTable.id, Number(orderId)));
      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  app2.get("/api/orders/:id/tracking", async (req, res) => {
    try {
      const orderId = req.params.id.replace("ORD-", "");
      const order = await db2.select().from(ordersTable).where(eq2(ordersTable.id, Number(orderId))).limit(1);
      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      const orderData = order[0];
      const trackingTimeline = generateTrackingTimeline(orderData.status, orderData.createdAt, orderData.estimatedDelivery);
      const trackingInfo = {
        orderId: `ORD-${orderData.id.toString().padStart(3, "0")}`,
        status: orderData.status,
        trackingNumber: orderData.trackingNumber,
        estimatedDelivery: orderData.estimatedDelivery?.toISOString().split("T")[0],
        timeline: trackingTimeline,
        currentStep: getCurrentStep(orderData.status),
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        createdAt: orderData.createdAt.toISOString().split("T")[0]
      };
      res.json(trackingInfo);
    } catch (error) {
      console.error("Error fetching tracking info:", error);
      res.status(500).json({ error: "Failed to fetch tracking information" });
    }
  });
  function generateTrackingTimeline(status, createdAt, estimatedDelivery) {
    const timeline = [
      {
        step: "Order Placed",
        status: "completed",
        date: createdAt.toISOString().split("T")[0],
        time: createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        description: "Your order has been placed successfully"
      }
    ];
    const orderDate = new Date(createdAt);
    if (status === "processing" || status === "shipped" || status === "delivered") {
      timeline.push({
        step: "Processing",
        status: "completed",
        date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        time: "10:00 AM",
        description: "Your order is being prepared for shipment"
      });
    } else if (status === "pending") {
      timeline.push({
        step: "Processing",
        status: "pending",
        date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        time: "Expected by 10:00 AM",
        description: "Your order will be processed within 24 hours"
      });
    }
    if (status === "shipped" || status === "delivered") {
      timeline.push({
        step: "Shipped",
        status: "completed",
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        time: "02:30 PM",
        description: "Your order has been shipped and is on the way"
      });
    } else if (status === "processing") {
      timeline.push({
        step: "Shipped",
        status: "pending",
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        time: "Expected by 2:00 PM",
        description: "Your order will be shipped soon"
      });
    }
    if (status === "delivered") {
      timeline.push({
        step: "Delivered",
        status: "completed",
        date: estimatedDelivery?.toISOString().split("T")[0] || new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        time: "11:45 AM",
        description: "Your order has been delivered successfully"
      });
    } else if (status === "shipped") {
      timeline.push({
        step: "Delivered",
        status: "pending",
        date: estimatedDelivery?.toISOString().split("T")[0] || new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        time: "Expected delivery",
        description: "Your order is out for delivery"
      });
    }
    return timeline;
  }
  function getCurrentStep(status) {
    switch (status) {
      case "pending":
        return 0;
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  }
  function generateSampleOrders() {
    const statuses = ["pending", "processing", "shipped", "delivered"];
    const customers = [];
    const products2 = [];
    const orders = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 0; i < 50; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1e3);
      const orderProducts = [];
      const numProducts = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;
      for (let j = 0; j < numProducts; j++) {
        const product = products2[Math.floor(Math.random() * products2.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseInt(product.price.replace(/[₹,]/g, ""));
        orderProducts.push({
          ...product,
          quantity
        });
        totalAmount += price * quantity;
      }
      orders.push({
        id: `ORD-${(i + 1).toString().padStart(3, "0")}`,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: `${customer.name}, ${Math.floor(Math.random() * 999) + 1} Sample Street, Mumbai, Maharashtra 400001`
        },
        date: orderDate.toISOString().split("T")[0],
        total: `\u20B9${totalAmount}`,
        totalAmount,
        status,
        items: orderProducts.length,
        paymentMethod: ["Credit Card", "UPI", "Net Banking"][Math.floor(Math.random() * 3)],
        trackingNumber: status === "shipped" || status === "delivered" ? `TRK${Math.random().toString(36).substring(7).toUpperCase()}` : null,
        estimatedDelivery: status === "shipped" ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0] : null,
        products: orderProducts,
        userId: Math.floor(Math.random() * 5) + 1,
        shippingAddress: `${customer.name}, ${Math.floor(Math.random() * 999) + 1} Sample Street, Mumbai, Maharashtra 400001`
      });
    }
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  function generateSampleSubcategories() {
    return [];
  }
  function generateSampleCategories() {
    const sampleProducts = generateSampleProducts();
    const baseCategories = [];
    return baseCategories.map((category) => {
      const productCount = sampleProducts.filter(
        (product) => product.category.toLowerCase() === category.slug.toLowerCase()
      ).length;
      return {
        ...category,
        productCount
      };
    });
  }
  function generateSampleCustomers() {
    const sampleCustomers = [
      { id: 1, firstName: "Priya", lastName: "Sharma", email: "priya@example.com", phone: "+91 98765 43210" },
      { id: 2, firstName: "Arjun", lastName: "Patel", email: "arjun@example.com", phone: "+91 87654 32109" },
      { id: 3, firstName: "Meera", lastName: "Reddy", email: "meera@example.com", phone: "+91 76543 21098" },
      { id: 4, firstName: "Rahul", lastName: "Kumar", email: "rahul@example.com", phone: "+91 65432 10987" },
      { id: 5, firstName: "Ananya", lastName: "Singh", email: "ananya@example.com", phone: "+91 54321 09876" }
    ];
    return sampleCustomers.map((customer) => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      orders: Math.floor(Math.random() * 10) + 1,
      spent: `\u20B9${(Math.random() * 8080 + 500).toFixed(2)}`,
      status: Math.random() > 0.7 ? "VIP" : Math.random() > 0.4 ? "Active" : "New",
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      firstName: customer.firstName,
      lastName: customer.lastName
    }));
  }
  function generateSampleProducts() {
    return [
      {
        id: 1,
        name: "Vitamin C Face Serum",
        slug: "vitamin-c-face-serum",
        description: "Brighten and rejuvenate your skin with our potent Vitamin C serum.",
        shortDescription: "Brighten and rejuvenate your skin",
        price: 699,
        originalPrice: 899,
        category: "Skincare",
        subcategory: "face-serums",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.5,
        reviewCount: 128,
        inStock: true,
        featured: true,
        bestseller: true,
        newLaunch: false,
        saleOffer: "22% OFF",
        variants: "30ml, 60ml",
        ingredients: "Vitamin C, Hyaluronic Acid, Niacinamide",
        benefits: "Brightens skin, reduces dark spots, anti-aging",
        howToUse: "Apply 2-3 drops on clean face, morning and evening",
        size: "30ml",
        tags: "vitamin-c,serum,brightening,anti-aging"
      },
      {
        id: 2,
        name: "Hyaluronic Acid Serum",
        slug: "hyaluronic-acid-serum",
        description: "Deep hydration serum for plump, moisturized skin.",
        shortDescription: "Intense hydration for all skin types",
        price: 549,
        originalPrice: 699,
        category: "Skincare",
        subcategory: "face-serums",
        imageUrl: "https://images.unsplash.com/photo-1598662779094-110c2bad80b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.4,
        reviewCount: 95,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: "21% OFF",
        variants: "30ml, 60ml",
        ingredients: "Hyaluronic Acid, Vitamin B5, Aloe Vera",
        benefits: "Deep hydration, plumps skin, reduces fine lines",
        howToUse: "Apply to damp skin, follow with moisturizer",
        size: "30ml",
        tags: "hydration,hyaluronic-acid,serum,moisturizing"
      },
      {
        id: 3,
        name: "Anti-Aging Night Cream",
        slug: "anti-aging-night-cream",
        description: "Restore and rejuvenate your skin overnight with our premium night cream.",
        shortDescription: "Restore and rejuvenate overnight",
        price: 899,
        originalPrice: 1199,
        category: "Skincare",
        subcategory: "moisturizers",
        imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.7,
        reviewCount: 156,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: true,
        saleOffer: "25% OFF",
        variants: "50ml, 100ml",
        ingredients: "Retinol, Peptides, Hyaluronic Acid",
        benefits: "Reduces wrinkles, improves skin texture, hydrates",
        howToUse: "Apply on clean face before bed, avoid eye area",
        size: "50ml",
        tags: "anti-aging,retinol,night-cream,moisturizer"
      },
      {
        id: 4,
        name: "Niacinamide Serum",
        slug: "niacinamide-serum",
        description: "Minimize pores and control oil with this powerful niacinamide serum.",
        shortDescription: "Pore minimizing and oil control",
        price: 449,
        originalPrice: 599,
        category: "Skincare",
        subcategory: "Serums",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.3,
        reviewCount: 78,
        inStock: true,
        featured: false,
        bestseller: false,
        newLaunch: true,
        saleOffer: "25% OFF",
        variants: "30ml",
        ingredients: "Niacinamide, Zinc, Hyaluronic Acid",
        benefits: "Minimizes pores, controls oil, evens skin tone",
        howToUse: "Apply twice daily to clean skin",
        size: "30ml",
        tags: "niacinamide,pore-minimizing,oil-control,serum"
      },
      {
        id: 5,
        name: "Hair Growth Serum",
        slug: "hair-growth-serum",
        description: "Stimulate hair growth and strengthen hair follicles with our advanced formula.",
        shortDescription: "Stimulate hair growth and strengthen",
        price: 599,
        originalPrice: 799,
        category: "Haircare",
        subcategory: "Serums",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.2,
        reviewCount: 89,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: "25% OFF",
        variants: "50ml, 100ml",
        ingredients: "Minoxidil, Caffeine, Biotin",
        benefits: "Promotes hair growth, strengthens hair, reduces hair fall",
        howToUse: "Apply to scalp, massage gently, leave overnight",
        size: "50ml",
        tags: "hair-growth,serum,biotin,minoxidil"
      },
      {
        id: 6,
        name: "Nourishing Hair Oil",
        slug: "nourishing-hair-oil",
        description: "Deep conditioning hair oil with natural ingredients for healthy, shiny hair.",
        shortDescription: "Deep conditioning for healthy hair",
        price: 399,
        originalPrice: 499,
        category: "Haircare",
        subcategory: "Oils",
        imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.5,
        reviewCount: 112,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: false,
        saleOffer: "20% OFF",
        variants: "100ml, 200ml",
        ingredients: "Argan Oil, Coconut Oil, Vitamin E",
        benefits: "Nourishes hair, adds shine, reduces frizz",
        howToUse: "Apply to damp hair, leave for 30 minutes, then wash",
        size: "100ml",
        tags: "hair-oil,nourishing,argan,coconut"
      },
      {
        id: 7,
        name: "Matte Liquid Lipstick",
        slug: "matte-liquid-lipstick",
        description: "Long-lasting matte liquid lipstick with intense color payoff.",
        shortDescription: "Long-lasting matte finish",
        price: 299,
        originalPrice: 399,
        category: "Makeup",
        subcategory: "Lips",
        imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.3,
        reviewCount: 67,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: "25% OFF",
        variants: "Red, Pink, Berry, Nude",
        ingredients: "Vitamin E, Jojoba Oil, Natural Waxes",
        benefits: "Long-lasting, transfer-proof, comfortable wear",
        howToUse: "Apply evenly to lips, allow to dry",
        size: "6ml",
        tags: "lipstick,matte,liquid,long-lasting"
      },
      {
        id: 8,
        name: "HD Foundation",
        slug: "hd-foundation",
        description: "High-definition foundation for flawless, natural-looking coverage.",
        shortDescription: "Flawless natural coverage",
        price: 799,
        originalPrice: 999,
        category: "Makeup",
        subcategory: "Face",
        imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.4,
        reviewCount: 89,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: false,
        saleOffer: "20% OFF",
        variants: "Fair, Light, Medium, Deep",
        ingredients: "Hyaluronic Acid, SPF 15, Vitamin C",
        benefits: "Full coverage, long-lasting, buildable",
        howToUse: "Apply with brush or sponge, blend well",
        size: "30ml",
        tags: "foundation,hd,coverage,makeup"
      },
      {
        id: 9,
        name: "Body Butter",
        slug: "body-butter",
        description: "Rich, nourishing body butter for deep moisturization.",
        shortDescription: "Deep moisturization for soft skin",
        price: 349,
        originalPrice: 449,
        category: "Body Care",
        subcategory: "Moisturizers",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.6,
        reviewCount: 134,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: "22% OFF",
        variants: "Vanilla, Coconut, Lavender",
        ingredients: "Shea Butter, Cocoa Butter, Vitamin E",
        benefits: "Deep moisturization, long-lasting softness",
        howToUse: "Apply to clean, dry skin, massage gently",
        size: "200ml",
        tags: "body-butter,moisturizer,shea,cocoa"
      },
      {
        id: 10,
        name: "Exfoliating Body Scrub",
        slug: "exfoliating-body-scrub",
        description: "Gentle exfoliating scrub to reveal smooth, glowing skin.",
        shortDescription: "Gentle exfoliation for smooth skin",
        price: 249,
        originalPrice: 329,
        category: "Body Care",
        subcategory: "Exfoliants",
        imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.2,
        reviewCount: 76,
        inStock: true,
        featured: false,
        bestseller: false,
        newLaunch: true,
        saleOffer: "24% OFF",
        variants: "Coffee, Sugar, Sea Salt",
        ingredients: "Natural Exfoliants, Coconut Oil, Vitamin E",
        benefits: "Removes dead skin, improves texture, moisturizes",
        howToUse: "Apply to wet skin, massage in circular motions, rinse",
        size: "300ml",
        tags: "body-scrub,exfoliant,coffee,sugar"
      },
      {
        id: 11,
        name: "Eye Drama Mascara",
        slug: "eye-drama-mascara",
        description: "Volumizing mascara for dramatic, bold lashes.",
        shortDescription: "Dramatic volume for bold lashes",
        price: 399,
        originalPrice: 549,
        category: "Eye Care",
        subcategory: "Eye Makeup",
        imageUrl: "https://images.unsplash.com/photo-1583847427292-a9695a5cf4c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.6,
        reviewCount: 142,
        inStock: true,
        featured: true,
        bestseller: true,
        newLaunch: false,
        saleOffer: "27% OFF",
        variants: "Black, Brown, Blue",
        ingredients: "Vitamin E, Keratin, Natural Waxes",
        benefits: "Volumizes lashes, long-lasting, waterproof",
        howToUse: "Apply from root to tip in zigzag motion",
        size: "12ml",
        tags: "mascara,eye-makeup,volume,drama"
      },
      {
        id: 12,
        name: "Eye Cream Anti-Aging",
        slug: "eye-cream-anti-aging",
        description: "Intensive eye cream to reduce dark circles and fine lines.",
        shortDescription: "Reduces dark circles and fine lines",
        price: 799,
        originalPrice: 999,
        category: "Eye Care",
        subcategory: "Eye Treatment",
        imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.5,
        reviewCount: 98,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: "20% OFF",
        variants: "15ml, 30ml",
        ingredients: "Retinol, Hyaluronic Acid, Caffeine",
        benefits: "Reduces dark circles, anti-aging, hydrates",
        howToUse: "Gently pat around eye area morning and night",
        size: "15ml",
        tags: "eye-cream,anti-aging,dark-circles,retinol"
      },
      {
        id: 13,
        name: "Beauty Blender Set",
        slug: "beauty-blender-set",
        description: "Professional makeup sponges for flawless application.",
        shortDescription: "Professional makeup sponges",
        price: 299,
        originalPrice: 399,
        category: "Beauty",
        subcategory: "Tools",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.4,
        reviewCount: 156,
        inStock: true,
        featured: false,
        bestseller: false,
        newLaunch: true,
        saleOffer: "25% OFF",
        variants: "Pink, Orange, Purple",
        ingredients: "Non-latex foam, Antimicrobial",
        benefits: "Seamless blending, reusable, easy to clean",
        howToUse: "Dampen sponge, squeeze out excess water, blend makeup",
        size: "Set of 3",
        tags: "beauty-blender,makeup-tools,sponge,blending"
      },
      {
        id: 14,
        name: "Eye Shadow Palette",
        slug: "eye-shadow-palette",
        description: "12 stunning shades for dramatic eye looks.",
        shortDescription: "12 shades for dramatic eyes",
        price: 599,
        originalPrice: 799,
        category: "Eye Care",
        subcategory: "Eye Makeup",
        imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        rating: 4.7,
        reviewCount: 189,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: false,
        saleOffer: "25% OFF",
        variants: "Warm Tones, Cool Tones, Neutral",
        ingredients: "Mica, Talc, Vitamin E",
        benefits: "High pigmentation, long-lasting, blendable",
        howToUse: "Apply with brush, blend well",
        size: "12 x 2g",
        tags: "eyeshadow,palette,eye-makeup,pigmented"
      }
    ];
  }
  app2.get("/api/admin/customers", async (req, res) => {
    try {
      let allUsers;
      try {
        allUsers = await db2.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          createdAt: users.createdAt
        }).from(users);
      } catch (dbError) {
        console.log("Database unavailable, using sample customer data");
        return res.json(generateSampleCustomers());
      }
      const customersWithStats = await Promise.all(
        allUsers.map(async (user) => {
          const userOrders = await db2.select({
            totalAmount: ordersTable.totalAmount,
            status: ordersTable.status
          }).from(ordersTable).where(eq2(ordersTable.userId, user.id));
          const orderCount = userOrders.length;
          const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
          let status = "New";
          if (orderCount === 0) {
            status = "Inactive";
          } else if (totalSpent > 2e3) {
            status = "VIP";
          } else if (orderCount > 0) {
            status = "Active";
          }
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || "N/A",
            orders: orderCount,
            spent: `\u20B9${totalSpent.toFixed(2)}`,
            status,
            joinedDate: user.createdAt.toISOString().split("T")[0],
            firstName: user.firstName,
            lastName: user.lastName
          };
        })
      );
      res.json(customersWithStats);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  app2.get("/api/admin/customers/:id", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const user = await db2.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt
      }).from(users).where(eq2(users.id, customerId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const customer = user[0];
      const customerOrders = await db2.select().from(ordersTable).where(eq2(ordersTable.userId, customerId)).orderBy(desc2(ordersTable.createdAt));
      const orderCount = customerOrders.length;
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      let status = "New";
      if (orderCount === 0) {
        status = "Inactive";
      } else if (totalSpent > 2e3) {
        status = "VIP";
      } else if (orderCount > 0) {
        status = "Active";
      }
      const customerWithStats = {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone || "N/A",
        orders: orderCount,
        spent: `\u20B9${totalSpent.toFixed(2)}`,
        status,
        joinedDate: customer.createdAt.toISOString().split("T")[0],
        firstName: customer.firstName,
        lastName: customer.lastName,
        recentOrders: customerOrders.slice(0, 5).map((order) => ({
          id: `ORD-${order.id.toString().padStart(3, "0")}`,
          date: order.createdAt.toISOString().split("T")[0],
          status: order.status,
          total: `\u20B9${order.totalAmount}`
        }))
      };
      res.json(customerWithStats);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer details" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;
      if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ error: "All required fields must be provided" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
      }
      const submissionData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : null,
        message: message.trim(),
        status: "unread"
      };
      const savedSubmission = await storage.createContactSubmission(submissionData);
      console.log("Contact form submission saved:", {
        id: savedSubmission.id,
        firstName,
        lastName,
        email,
        subject: subject || "General Inquiry",
        timestamp: savedSubmission.createdAt
      });
      res.json({
        message: "Thank you for your message! We'll get back to you within 24 hours.",
        success: true,
        submissionId: savedSubmission.id
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });
  app2.get("/api/admin/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ error: "Failed to fetch contact submissions" });
    }
  });
  app2.get("/api/admin/contact-submissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await storage.getContactSubmission(parseInt(id));
      if (!submission) {
        return res.status(404).json({ error: "Contact submission not found" });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching contact submission:", error);
      res.status(500).json({ error: "Failed to fetch contact submission" });
    }
  });
  app2.put("/api/admin/contact-submissions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["unread", "read", "responded"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be: unread, read, or responded" });
      }
      const respondedAt = status === "responded" ? /* @__PURE__ */ new Date() : void 0;
      const updatedSubmission = await storage.updateContactSubmissionStatus(parseInt(id), status, respondedAt);
      if (!updatedSubmission) {
        return res.status(404).json({ error: "Contact submission not found" });
      }
      res.json({
        message: "Contact submission status updated successfully",
        submission: updatedSubmission
      });
    } catch (error) {
      console.error("Error updating contact submission status:", error);
      res.status(500).json({ error: "Failed to update contact submission status" });
    }
  });
  app2.delete("/api/admin/contact-submissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContactSubmission(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Contact submission not found" });
      }
      res.json({ success: true, message: "Contact submission deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact submission:", error);
      res.status(500).json({ error: "Failed to delete contact submission" });
    }
  });
  app2.get("/api/orders/:id/invoice", async (req, res) => {
    try {
      const orderId = req.params.id.replace("ORD-", "");
      const order = await db2.select().from(ordersTable).where(eq2(ordersTable.id, Number(orderId))).limit(1);
      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await db2.select({
        id: orderItemsTable.id,
        name: orderItemsTable.productName,
        quantity: orderItemsTable.quantity,
        price: orderItemsTable.price,
        image: orderItemsTable.productImage
      }).from(orderItemsTable).where(eq2(orderItemsTable.orderId, order[0].id));
      const user = await db2.select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone
      }).from(users).where(eq2(users.id, order[0].userId)).limit(1);
      const userData = user[0] || { firstName: "Unknown", lastName: "Customer", email: "unknown@email.com", phone: "N/A" };
      const invoiceHtml = generateInvoiceHTML({
        order: order[0],
        items,
        customer: userData,
        orderId: `ORD-${order[0].id.toString().padStart(3, "0")}`
      });
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="Invoice-ORD-${order[0].id.toString().padStart(3, "0")}.html"`);
      res.send(invoiceHtml);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ error: "Failed to generate invoice" });
    }
  });
  function generateInvoiceHTML({ order, items, customer, orderId }) {
    const subtotal = items.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/[₹,]/g, ""));
      return sum + price * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${orderId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f4f4f4;
            padding: 20px;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 20px;
        }

        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 10px;
        }

        .company-details {
            color: #666;
            font-size: 14px;
            line-height: 1.4;
        }

        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            color: #333;
        }

        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }

        .info-section h3 {
            color: #e74c3c;
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: bold;
        }

        .info-section p {
            margin-bottom: 8px;
            font-size: 14px;
        }

        .customer-info {
            text-align: right;
        }

        .status-badge {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            font-size: 14px;
        }

        .items-table th {
            background: #e74c3c;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: bold;
        }

        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
        }

        .items-table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }

        .items-table .text-right {
            text-align: right;
        }

        .totals {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }

        .totals-table {
            width: 300px;
        }

        .totals-table tr {
            border-bottom: 1px solid #eee;
        }

        .totals-table td {
            padding: 8px 0;
            font-size: 14px;
        }

        .totals-table .text-right {
            text-align: right;
        }

        .grand-total {
            font-weight: bold;
            font-size: 18px;
            color: #e74c3c;
            border-top: 2px solid #e74c3c !important;
            padding-top: 15px !important;
        }

        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 13px;
        }

        .footer p {
            margin-bottom: 8px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-name">Beauty Store</div>
            <div class="company-details">
                Premium Beauty & Skincare Products<br>
                123 Beauty Street, Mumbai, Maharashtra 400001<br>
                Email: info@beautystore.com | Phone: +91 98765 43210<br>
                GST No: 27ABCDE1234F1Z5
            </div>
        </div>

        <h1 class="invoice-title">INVOICE</h1>

        <div class="invoice-info">
            <div class="info-section">
                <h3>Invoice Details</h3>
                <p><strong>Invoice No:</strong> ${orderId}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                <p><strong>Status:</strong> <span class="status-badge">${order.status}</span></p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ""}
            </div>

            <div class="info-section customer-info">
                <h3>Bill To</h3>
                <p><strong>${customer.firstName} ${customer.lastName}</strong></p>
                <p>${customer.email}</p>
                ${customer.phone ? `<p>${customer.phone}</p>` : ""}
                <br>
                <p><strong>Shipping Address:</strong></p>
                <p>${order.shippingAddress}</p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item) => {
      const unitPrice = parseInt(item.price.replace(/[₹,]/g, ""));
      const itemTotal = unitPrice * item.quantity;
      return `
                    <tr>
                        <td>${item.name}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">\u20B9${unitPrice.toLocaleString("en-IN")}</td>
                        <td class="text-right">\u20B9${itemTotal.toLocaleString("en-IN")}</td>
                    </tr>
                  `;
    }).join("")}
            </tbody>
        </table>

        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">\u20B9${subtotal.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                    <td>GST (18%):</td>
                    <td class="text-right">\u20B9${tax.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                    <td>Shipping:</td>
                    <td class="text-right">Free</td>
                </tr>
                <tr class="grand-total">
                    <td><strong>Grand Total:</strong></td>
                    <td class="text-right"><strong>\u20B9${total.toLocaleString("en-IN")}</strong></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>This is a computer generated invoice. No signature required.</p>
            <p>For any queries, please contact us at support@beautystore.com</p>
            <p>Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN")} at ${(/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN")}</p>
        </div>
    </div>
</body>
</html>`;
  }
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const products2 = await storage.getFeaturedProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || query.trim().length === 0) {
        return res.json([]);
      }
      const products2 = await storage.searchProducts(query);
      return res.json(products2);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });
  app2.get("/api/auth/validate", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No valid token provided" });
      }
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        res.json({ valid: true, message: "Token is valid", user: decoded });
      } catch (jwtError) {
        return res.status(401).json({ error: "Invalid token" });
      }
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(401).json({ error: "Token validation failed" });
    }
  });
  app2.get("/api/admin/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || query.toString().trim().length === 0) {
        return res.json({ products: [], customers: [], orders: [] });
      }
      console.log("Admin search query:", query);
      const searchTerm = query.toString().toLowerCase();
      let products2 = [];
      try {
        const allProducts = await storage.getProducts();
        products2 = allProducts.filter(
          (product) => product.name.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm) || product.subcategory && product.subcategory.toLowerCase().includes(searchTerm) || product.tags && product.tags.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
      } catch (error) {
        console.log("Products search failed:", error.message);
        products2 = [];
      }
      let customers = [];
      try {
        const allUsers = await db2.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          createdAt: users.createdAt
        }).from(users);
        customers = allUsers.filter(
          (user) => user.firstName && user.firstName.toLowerCase().includes(searchTerm) || user.lastName && user.lastName.toLowerCase().includes(searchTerm) || user.email && user.email.toLowerCase().includes(searchTerm) || `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase().includes(searchTerm)
        ).map((user) => ({
          id: user.id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email,
          phone: user.phone || "N/A"
        })).slice(0, 5);
      } catch (error) {
        console.log("Customers search failed:", error.message);
        customers = [];
      }
      let orders = [];
      try {
        const allOrders = await db2.select().from(ordersTable).orderBy(desc2(ordersTable.createdAt));
        orders = await Promise.all(
          allOrders.filter((order) => {
            const orderId = `ORD-${order.id.toString().padStart(3, "0")}`;
            return orderId.toLowerCase().includes(searchTerm) || order.status && order.status.toLowerCase().includes(searchTerm);
          }).slice(0, 5).map(async (order) => {
            try {
              const user = await db2.select({
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email
              }).from(users).where(eq2(users.id, order.userId)).limit(1);
              const userData = user[0] || { firstName: "Unknown", lastName: "Customer", email: "unknown@email.com" };
              return {
                id: `ORD-${order.id.toString().padStart(3, "0")}`,
                customerName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Unknown Customer",
                customerEmail: userData.email,
                date: order.createdAt.toISOString().split("T")[0],
                status: order.status,
                total: `\u20B9${order.totalAmount}`
              };
            } catch (userError) {
              console.log("Error fetching user for order:", order.id);
              return {
                id: `ORD-${order.id.toString().padStart(3, "0")}`,
                customerName: "Unknown Customer",
                customerEmail: "unknown@email.com",
                date: order.createdAt.toISOString().split("T")[0],
                status: order.status,
                total: `\u20B9${order.totalAmount}`
              };
            }
          })
        );
      } catch (error) {
        console.log("Orders search failed:", error.message);
        orders = [];
      }
      res.json({ products: products2, customers, orders });
    } catch (error) {
      console.error("Admin search error:", error);
      res.status(500).json({ error: "Failed to perform admin search" });
    }
  });
  app2.get("/api/shades", async (req, res) => {
    try {
      const activeShades = await storage.getActiveShades();
      res.json(activeShades);
    } catch (error) {
      console.log("Database unavailable, using sample shade data");
      const defaultShades = [
        { id: 1, name: "Fair to Light", colorCode: "#F7E7CE", value: "fair-light", isActive: true, sortOrder: 1 },
        { id: 2, name: "Light to Medium", colorCode: "#F5D5AE", value: "light-medium", isActive: true, sortOrder: 2 },
        { id: 3, name: "Medium", colorCode: "#E8B895", value: "medium", isActive: true, sortOrder: 3 },
        { id: 4, name: "Medium to Deep", colorCode: "#D69E2E", value: "medium-deep", isActive: true, sortOrder: 4 },
        { id: 5, name: "Deep", colorCode: "#B7791F", value: "deep", isActive: true, sortOrder: 5 },
        { id: 6, name: "Very Deep", colorCode: "#975A16", value: "very-deep", isActive: true, sortOrder: 6 },
        { id: 7, name: "Porcelain", colorCode: "#FFF8F0", value: "porcelain", isActive: true, sortOrder: 7 },
        { id: 8, name: "Ivory", colorCode: "#FFFFF0", value: "ivory", isActive: true, sortOrder: 8 },
        { id: 9, name: "Beige", colorCode: "#F5F5DC", value: "beige", isActive: true, sortOrder: 9 },
        { id: 10, name: "Sand", colorCode: "#F4A460", value: "sand", isActive: true, sortOrder: 10 },
        { id: 11, name: "Honey", colorCode: "#FFB347", value: "honey", isActive: true, sortOrder: 11 },
        { id: 12, name: "Caramel", colorCode: "#AF6F09", value: "caramel", isActive: true, sortOrder: 12 },
        { id: 13, name: "Cocoa", colorCode: "#7B3F00", value: "cocoa", isActive: true, sortOrder: 13 },
        { id: 14, name: "Espresso", colorCode: "#3C2415", value: "espresso", isActive: true, sortOrder: 14 }
      ];
      res.json(defaultShades);
    }
  });
  app2.get("/api/admin/shades", async (req, res) => {
    try {
      const allShades = await storage.getShades();
      res.json(allShades);
    } catch (error) {
      console.error("Error fetching shades:", error);
      res.status(500).json({ error: "Failed to fetch shades" });
    }
  });
  app2.post("/api/admin/shades", async (req, res) => {
    try {
      console.log("Creating shade with data:", req.body);
      const { name, colorCode, value, isActive, sortOrder, categoryIds, subcategoryIds, productIds, imageUrl } = req.body;
      if (!name || !colorCode) {
        return res.status(400).json({ error: "Name and color code are required" });
      }
      if (name.trim().length === 0) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      if (!colorCode.match(/^#[0-9A-Fa-f]{6}$/)) {
        return res.status(400).json({ error: "Invalid color code format. Use hex format like #FF0000" });
      }
      const generatedValue = value && value.trim() ? value.trim() : name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const shadeData = {
        name: name.trim(),
        colorCode: colorCode.trim().toUpperCase(),
        value: generatedValue,
        isActive: Boolean(isActive ?? true),
        sortOrder: Number(sortOrder) || 0,
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
        subcategoryIds: Array.isArray(subcategoryIds) ? subcategoryIds : [],
        productIds: Array.isArray(productIds) ? productIds : [],
        imageUrl: imageUrl || null
      };
      console.log("Processed shade data:", shadeData);
      const shade = await storage.createShade(shadeData);
      console.log("Shade created successfully:", shade);
      res.status(201).json(shade);
    } catch (error) {
      console.error("Error creating shade:", error);
      let errorMessage = "Failed to create shade";
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.message && error.message.includes("unique constraint")) {
        errorMessage = "A shade with this value already exists. Please choose a different name or value.";
      }
      res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : void 0
      });
    }
  });
  app2.put("/api/admin/shades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating shade with ID:", id);
      console.log("Update data:", req.body);
      const { name, colorCode, value, isActive, sortOrder, categoryIds, subcategoryIds, productIds, imageUrl } = req.body;
      if (name && name.trim().length === 0) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      if (colorCode && !colorCode.match(/^#[0-9A-Fa-f]{6}$/)) {
        return res.status(400).json({ error: "Invalid color code format. Use hex format like #FF0000" });
      }
      const updateData = {};
      if (name !== void 0) updateData.name = name.trim();
      if (colorCode !== void 0) updateData.colorCode = colorCode.trim().toUpperCase();
      if (value !== void 0) updateData.value = value.trim() || name?.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (isActive !== void 0) updateData.isActive = Boolean(isActive);
      if (sortOrder !== void 0) updateData.sortOrder = Number(sortOrder) || 0;
      if (categoryIds !== void 0) updateData.categoryIds = Array.isArray(categoryIds) ? categoryIds : [];
      if (subcategoryIds !== void 0) updateData.subcategoryIds = Array.isArray(subcategoryIds) ? subcategoryIds : [];
      if (productIds !== void 0) updateData.productIds = Array.isArray(productIds) ? productIds : [];
      if (imageUrl !== void 0) updateData.imageUrl = imageUrl || null;
      console.log("Processed update data:", updateData);
      const updatedShade = await storage.updateShade(parseInt(id), updateData);
      if (!updatedShade) {
        return res.status(404).json({ error: "Shade not found" });
      }
      console.log("Shade updated successfully:", updatedShade);
      res.json(updatedShade);
    } catch (error) {
      console.error("Error updating shade:", error);
      let errorMessage = "Failed to update shade";
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.message && error.message.includes("unique constraint")) {
        errorMessage = "A shade with this value already exists. Please choose a different name or value.";
      }
      res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : void 0
      });
    }
  });
  app2.delete("/api/admin/shades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteShade(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Shade not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting shade:", error);
      res.status(500).json({ error: "Failed to delete shade" });
    }
  });
  app2.get("/api/admin/sliders", async (req, res) => {
    try {
      const allSliders = await db2.select().from(sliders).orderBy(desc2(sliders.sortOrder));
      res.json(allSliders);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      res.status(500).json({ error: "Failed to fetch sliders" });
    }
  });
  app2.post("/api/admin/sliders", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Image file is required"
        });
      }
      const imageUrl = `/api/images/${req.file.filename}`;
      const [newSlider] = await db2.insert(sliders).values({
        title: `Image ${Date.now()}`,
        subtitle: "",
        description: "Uploaded image",
        imageUrl,
        badge: "",
        primaryActionText: "",
        primaryActionUrl: "",
        isActive: true,
        sortOrder: 0
      }).returning();
      res.json(newSlider);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({
        error: "Failed to upload image",
        details: error.message
      });
    }
  });
  app2.put("/api/admin/sliders/:id", upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const body = req.body;
      let imageUrl = body.imageUrl;
      if (req.file) {
        imageUrl = `/api/images/${req.file?.filename}`;
      }
      const [updatedSlider] = await db2.update(sliders).set({
        imageUrl,
        isActive: body.isActive === "true",
        sortOrder: parseInt(body.sortOrder, 10),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq2(sliders.id, id)).returning();
      if (!updatedSlider) {
        return res.status(404).json({ error: "Slider not found" });
      }
      res.json(updatedSlider);
    } catch (error) {
      console.error("Error updating slider:", error);
      res.status(500).json({ error: "Failed to update slider" });
    }
  });
  app2.delete("/api/admin/sliders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [deletedSlider] = await db2.delete(sliders).where(eq2(sliders.id, id)).returning();
      if (!deletedSlider) {
        return res.status(404).json({ error: "Slider not found" });
      }
      res.json({ message: "Slider deleted successfully" });
    } catch (error) {
      console.error("Error deleting slider:", error);
      res.status(500).json({ error: "Failed to delete slider" });
    }
  });
  app2.get("/api/products/:productId/shades", async (req, res) => {
    try {
      const { productId } = req.params;
      const shades2 = await storage.getProductShades(parseInt(productId));
      res.json(shades2);
    } catch (error) {
      console.error("Error fetching product shades:", error);
      res.status(500).json({ error: "Failed to fetch product shades" });
    }
  });
  app2.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const { productId } = req.params;
      const productReviews = await storage.getProductReviews(parseInt(productId));
      res.json(productReviews);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app2.get("/api/products/:productId/can-review", async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.query.userId;
      if (!userId) {
        return res.status(401).json({ error: "User authentication required" });
      }
      const result = await storage.checkUserCanReview(parseInt(userId), parseInt(productId));
      res.json(result);
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ error: "Failed to check review eligibility" });
    }
  });
  app2.post("/api/products/:productId/reviews", upload.single("image"), async (req, res) => {
    try {
      const { productId } = req.params;
      const { userId, rating, reviewText, orderId } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "User authentication required" });
      }
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      const canReviewCheck = await storage.checkUserCanReview(parseInt(userId), parseInt(productId));
      if (!canReviewCheck.canReview) {
        return res.status(403).json({ error: canReviewCheck.message });
      }
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/api/images/${req.file.filename}`;
      }
      const reviewData = {
        userId: parseInt(userId),
        productId: parseInt(productId),
        orderId: parseInt(orderId) || canReviewCheck.orderId,
        rating: parseInt(rating),
        reviewText: reviewText || null,
        imageUrl,
        isVerified: true
      };
      const review = await storage.createReview(reviewData);
      res.status(201).json({
        message: "Review submitted successfully",
        review
      });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to submit review" });
    }
  });
  app2.get("/api/users/:userId/reviews", async (req, res) => {
    try {
      const { userId } = req.params;
      const userReviews = await storage.getUserReviews(parseInt(userId));
      res.json(userReviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ error: "Failed to fetch user reviews" });
    }
  });
  app2.delete("/api/reviews/:reviewId", async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { userId } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "User authentication required" });
      }
      const success = await storage.deleteReview(parseInt(reviewId), parseInt(userId));
      if (!success) {
        return res.status(404).json({ error: "Review not found or unauthorized" });
      }
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 8080;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
