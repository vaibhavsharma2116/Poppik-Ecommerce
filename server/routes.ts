import type { Express } from "express";
import { createServer, type Server } from "http";
import { ProductController } from "./controllers/product.controller";
import { CategoryController } from "./controllers/category.controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", ProductController.getAllProducts);
  app.get("/api/products/featured", ProductController.getFeaturedProducts);
  app.get("/api/products/bestsellers", ProductController.getBestsellerProducts);
  app.get("/api/products/new-launches", ProductController.getNewLaunchProducts);
  app.get("/api/products/search", ProductController.searchProducts);
  app.get("/api/products/category/:category", ProductController.getProductsByCategory);
  app.get("/api/products/:slug", ProductController.getProductBySlug);
  app.post("/api/products", ProductController.createProduct);
  app.put("/api/products/:id", ProductController.updateProduct);
  app.delete("/api/products/:id", ProductController.deleteProduct);

  // Category routes
  app.get("/api/categories", CategoryController.getAllCategories);
  app.get("/api/categories/:slug", CategoryController.getCategoryBySlug);
  app.post("/api/categories", CategoryController.createCategory);
  app.put("/api/categories/:id", CategoryController.updateCategory);
  app.delete("/api/categories/:id", CategoryController.deleteCategory);

  // Admin routes (add ID-based routes for admin operations)
  app.get("/api/admin/products/:id", ProductController.getProductById);
  app.get("/api/admin/categories/:id", CategoryController.getCategoryById);

  const httpServer = createServer(app);
  return httpServer;
}