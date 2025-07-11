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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/my_pgdb",
});

let db: ReturnType<typeof drizzle> | undefined = undefined;

async function getDb() {
  if (!db) {
    try {
      // Test the connection
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
    const db = await getDb();
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const db = await getDb();
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    const db = await getDb();
    return await db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const db = await getDb();
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const db = await getDb();
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async getBestsellerProducts(): Promise<Product[]> {
    const db = await getDb();
    return await db.select().from(products).where(eq(products.bestseller, true));
  }

  async getNewLaunchProducts(): Promise<Product[]> {
    const db = await getDb();
    return await db.select().from(products).where(eq(products.newLaunch, true));
  }

  async createProduct(productData: any): Promise<Product> {
    const db = await getDb();
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
      console.log("Inserting product data:", productToInsert);
      const result = await db.insert(products).values(productToInsert).returning();

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

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      const db = await getDb();
      // Clean up the data before updating
      const cleanData: any = { ...productData };

      // Handle numeric fields
      if (cleanData.price !== undefined) {
        cleanData.price = parseFloat(cleanData.price) || 0;
      }
      if (cleanData.rating !== undefined) {
        cleanData.rating = parseFloat(cleanData.rating) || 0;
      }
      if (cleanData.reviewCount !== undefined) {
        cleanData.reviewCount = parseInt(cleanData.reviewCount) || 0;
      }

      // Handle empty string fields - convert to null
      const stringFields = ['subcategory', 'saleOffer', 'size', 'ingredients', 'benefits', 'howToUse', 'tags'];
      stringFields.forEach(field => {
        if (cleanData[field] === '') {
          cleanData[field] = null;
        }
      });

      // Generate slug if name is provided
      if (cleanData.name) {
        cleanData.slug = cleanData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      const [updatedProduct] = await db
        .update(products)
        .set(cleanData)
        .where(eq(products.id, id))
        .returning();

      return updatedProduct || null;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const db = await getDb();
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const db = await getDb();
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async getCategories(): Promise<Category[]> {
    const db = await getDb();
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const db = await getDb();
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
    const db = await getDb();
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Subcategories
  async getSubcategory(id: number): Promise<Subcategory | undefined> {
    const db = await getDb();
    const result = await db.select().from(subcategories).where(eq(subcategories.id, id)).limit(1);
    return result[0];
  }

  async getSubcategoryBySlug(slug: string): Promise<Subcategory | undefined> {
    const db = await getDb();
    const result = await db.select().from(subcategories).where(eq(subcategories.slug, slug)).limit(1);
    return result[0];
  }

  async getSubcategories(): Promise<Subcategory[]> {
    const db = await getDb();
    return await db.select().from(subcategories);
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    const db = await getDb();
    return await db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const db = await getDb();
    const result = await db.insert(subcategories).values(subcategory).returning();
    return result[0];
  }

  async updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    const db = await getDb();
    const result = await db.update(subcategories).set(subcategory).where(eq(subcategories.id, id)).returning();
    return result[0];
  }

  async deleteSubcategory(id: number): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(subcategories).where(eq(subcategories.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();