
import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { insertCategorySchema } from "../../shared/schema";

export class CategoryController {
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const category = await CategoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  static async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const category = await CategoryService.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await CategoryService.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await CategoryService.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await CategoryService.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
}
