
import { db } from "../database";
import { products, type Product, type InsertProduct } from "../../shared/schema";
import { eq, like } from "drizzle-orm";

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    return await db.select().from(products);
  }

  static async findById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0] || null;
  }

  static async findBySlug(slug: string): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.slug, slug));
    return result[0] || null;
  }

  static async findByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  static async findFeatured(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  static async findBestsellers(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.bestseller, true));
  }

  static async findNewLaunches(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.newLaunch, true));
  }

  static async search(query: string): Promise<Product[]> {
    return await db.select().from(products).where(like(products.name, `%${query}%`));
  }

  static async create(data: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  }

  static async update(id: number, data: Partial<InsertProduct>): Promise<Product | null> {
    const result = await db.update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return result[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }
}
