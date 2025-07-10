
import { db } from "../database";
import { categories, type Category, type InsertCategory } from "../../shared/schema";
import { eq } from "drizzle-orm";

export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  static async findById(id: number): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0] || null;
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0] || null;
  }

  static async create(data: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(data).returning();
    return result[0];
  }

  static async update(id: number, data: Partial<InsertCategory>): Promise<Category | null> {
    const result = await db.update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return result[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }
}
