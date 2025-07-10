
import { ProductModel } from "../models/product.model";
import { type Product, type InsertProduct } from "../../shared/schema";

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    return await ProductModel.findAll();
  }

  static async getProductById(id: number): Promise<Product | null> {
    return await ProductModel.findById(id);
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    return await ProductModel.findBySlug(slug);
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    return await ProductModel.findByCategory(category);
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    return await ProductModel.findFeatured();
  }

  static async getBestsellerProducts(): Promise<Product[]> {
    return await ProductModel.findBestsellers();
  }

  static async getNewLaunchProducts(): Promise<Product[]> {
    return await ProductModel.findNewLaunches();
  }

  static async searchProducts(query: string): Promise<Product[]> {
    return await ProductModel.search(query);
  }

  static async createProduct(data: InsertProduct): Promise<Product> {
    // Generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    return await ProductModel.create(data);
  }

  static async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | null> {
    // Update slug if name is being changed
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    return await ProductModel.update(id, data);
  }

  static async deleteProduct(id: number): Promise<boolean> {
    return await ProductModel.delete(id);
  }
}
