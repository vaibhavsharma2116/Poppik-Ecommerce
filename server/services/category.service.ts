
import { CategoryModel } from "../models/category.model";
import { type Category, type InsertCategory } from "../../shared/schema";

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    return await CategoryModel.findAll();
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    return await CategoryModel.findById(id);
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await CategoryModel.findBySlug(slug);
  }

  static async createCategory(data: InsertCategory): Promise<Category> {
    // Generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    return await CategoryModel.create(data);
  }

  static async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | null> {
    // Update slug if name is being changed
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    return await CategoryModel.update(id, data);
  }

  static async deleteCategory(id: number): Promise<boolean> {
    return await CategoryModel.delete(id);
  }
}
