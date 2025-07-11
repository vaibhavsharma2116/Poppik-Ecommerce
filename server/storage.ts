import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { 
  products, 
  categories, 
  subcategories, 
  type Product, 
  type Category, 
  type Subcategory, 
  type InsertProduct, 
  type InsertCategory, 
  type InsertSubcategory 
} from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getBestsellerProducts(): Promise<Product[]>;
  getNewLaunchProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Subcategories
  getSubcategory(id: number): Promise<Subcategory | undefined>;
  getSubcategoryBySlug(slug: string): Promise<Subcategory | undefined>;
  getSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined>;
  deleteSubcategory(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async getBestsellerProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.bestseller, true));
  }

  async getNewLaunchProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.newLaunch, true));
  }

  async createProduct(productData: any): Promise<Product> {
    console.log("Creating product with data:", productData);

    // Validate only essential required fields
    const { name, price, category, description } = productData;
    if (!name || !price || !category || !description) {
      throw new Error("Missing required fields: name, price, category, and description are required");
    }

    // Generate slug from name if not provided
    const slug = productData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const productToInsert = {
      name: String(name).trim(),
      slug,
      description: String(description).trim(),
      shortDescription: productData.shortDescription ? String(productData.shortDescription).trim() : description.slice(0, 100),
      price: Number(price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      category: String(category).trim(),
      subcategory: productData.subcategory ? String(productData.subcategory).trim() : null,
      imageUrl: productData.imageUrl ? String(productData.imageUrl).trim() : 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      rating: Number(productData.rating) || 4.0,
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
      tags: productData.tags ? String(productData.tags).trim() : null,
    };

    console.log("Inserting product:", productToInsert);

    try {
      const result = await db.insert(products).values(productToInsert).returning();
      console.log("Created product:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Database error creating product:", error);
      throw new Error("Failed to create product in database");
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      console.log("Creating category with data:", category);
      const result = await db.insert(categories).values(category).returning();
      console.log("Category created successfully:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Subcategories
  async getSubcategory(id: number): Promise<Subcategory | undefined> {
    const result = await db.select().from(subcategories).where(eq(subcategories.id, id)).limit(1);
    return result[0];
  }

  async getSubcategoryBySlug(slug: string): Promise<Subcategory | undefined> {
    const result = await db.select().from(subcategories).where(eq(subcategories.slug, slug)).limit(1);
    return result[0];
  }

  async getSubcategories(): Promise<Subcategory[]> {
    return await db.select().from(subcategories);
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    return await db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const result = await db.insert(subcategories).values(subcategory).returning();
    return result[0];
  }

  async updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    const result = await db.update(subcategories).set(subcategory).where(eq(subcategories.id, id)).returning();
    return result[0];
  }

  async deleteSubcategory(id: number): Promise<boolean> {
    const result = await db.delete(subcategories).where(eq(subcategories.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();