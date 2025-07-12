import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";
import { Pool } from "pg";
import { ordersTable, orderItemsTable, users } from "../shared/schema";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/my_pgdb",
});

const db = drizzle(pool);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for disk storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All required fields must be provided" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords don't match" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Return user data (without password) and token
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Return user data (without password) and token
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

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Serve uploaded images
  app.use("/api/images", (req, res, next) => {
    const imagePath = path.join(uploadsDir, req.path);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Set appropriate content type based on file extension
    const extension = path.extname(imagePath).toLowerCase();
    const contentType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[extension] || 'image/jpeg';

    res.set('Content-Type', contentType);
    res.sendFile(imagePath);
  });

  // Image upload API
  app.post("/api/upload/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return the file URL
      const imageUrl = `/api/images/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/bestsellers", async (req, res) => {
    try {
      const products = await storage.getBestsellerProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bestseller products" });
    }
  });

  app.get("/api/products/new-launches", async (req, res) => {
    try {
      const products = await storage.getNewLaunchProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new launch products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
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

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
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

  app.post("/api/products", async (req, res) => {
    try {
      console.log("Received product data:", req.body);

      // Ensure we always return JSON
      res.setHeader('Content-Type', 'application/json');

      // Validate only essential required fields
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

  app.put("/api/products/:id", async (req, res) => {
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

  app.delete("/api/products/:id", async (req, res) => {
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

  app.post("/api/categories", async (req, res) => {
    try {
      console.log("Received category data:", req.body);

      // Validate required fields
      const { name, description, imageUrl } = req.body;
      if (!name || !description || !imageUrl) {
        return res.status(400).json({ 
          error: "Missing required fields: name, description, and imageUrl are required" 
        });
      }

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const categoryData = {
        ...req.body,
        slug,
        status: req.body.status || 'Active',
        productCount: req.body.productCount || 0
      };

      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Category creation error:", error);
      res.status(500).json({ error: "Failed to create category", details: error.message });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
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

  app.delete("/api/categories/:id", async (req, res) => {
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

  // Subcategories API
  app.get("/api/subcategories", async (req, res) => {
    try {
      const subcategories = await storage.getSubcategories();
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcategories" });
    }
  });

  app.get("/api/subcategories/category/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const subcategories = await storage.getSubcategoriesByCategory(parseInt(categoryId));
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcategories" });
    }
  });

  app.get("/api/subcategories/:slug", async (req, res) => {
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

  app.post("/api/subcategories", async (req, res) => {
    try {
      const subcategory = await storage.createSubcategory(req.body);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to create subcategory" });
    }
  });

  app.put("/api/subcategories/:id", async (req, res) => {
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

  app.delete("/api/subcategories/:id", async (req, res) => {
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

  // Admin Orders endpoints
  app.get("/api/admin/orders", async (req, res) => {
    try {
      // Get all orders from database
      const orders = await db
        .select()
        .from(ordersTable)
        .orderBy(desc(ordersTable.createdAt));

      // Get order items for each order and user info
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const items = await db
            .select({
              id: orderItemsTable.id,
              name: orderItemsTable.productName,
              quantity: orderItemsTable.quantity,
              price: orderItemsTable.price,
              image: orderItemsTable.productImage,
            })
            .from(orderItemsTable)
            .where(eq(orderItemsTable.orderId, order.id));

          // Get user info
          const user = await db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
              phone: users.phone,
            })
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1);

          const userData = user[0] || { firstName: 'Unknown', lastName: 'Customer', email: 'unknown@email.com', phone: 'N/A' };

          return {
            id: `ORD-${order.id.toString().padStart(3, '0')}`,
            customer: {
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              phone: userData.phone || 'N/A',
              address: order.shippingAddress,
            },
            date: order.createdAt.toISOString().split('T')[0],
            total: `₹${order.totalAmount}`,
            status: order.status,
            items: items.length,
            paymentMethod: order.paymentMethod,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery?.toISOString().split('T')[0],
            products: items,
            userId: order.userId,
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress,
          };
        })
      );

      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Send order notification
  app.post("/api/orders/:id/notify", async (req, res) => {
    try {
      const orderId = req.params.id.replace('ORD-', '');
      const { status } = req.body;

      // Get order and user info
      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, Number(orderId)))
        .limit(1);

      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, order[0].userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Here you would typically send an email notification
      // For now, we'll just log it
      console.log(`Sending ${status} notification to ${user[0].email} for order ORD-${orderId}`);
      
      // You can integrate with email services like SendGrid, Mailgun, etc.
      // Example notification content based on status
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

  // Orders endpoints
  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Get orders from database
      const orders = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.userId, Number(userId)))
        .orderBy(desc(ordersTable.createdAt));

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await db
            .select({
              id: orderItemsTable.id,
              name: orderItemsTable.productName,
              quantity: orderItemsTable.quantity,
              price: orderItemsTable.price,
              image: orderItemsTable.productImage,
            })
            .from(orderItemsTable)
            .where(eq(orderItemsTable.orderId, order.id));

          return {
            id: `ORD-${order.id.toString().padStart(3, '0')}`,
            date: order.createdAt.toISOString().split('T')[0],
            status: order.status,
            total: `₹${order.totalAmount}`,
            items,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery?.toISOString().split('T')[0],
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            userId: order.userId,
          };
        })
      );

      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = req.params.id.replace('ORD-', '');

      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, Number(orderId)))
        .limit(1);

      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const items = await db
        .select({
          id: orderItemsTable.id,
          name: orderItemsTable.productName,
          quantity: orderItemsTable.quantity,
          price: orderItemsTable.price,
          image: orderItemsTable.productImage,
        })
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order[0].id));

      const orderWithItems = {
        id: `ORD-${order[0].id.toString().padStart(3, '0')}`,
        date: order[0].createdAt.toISOString().split('T')[0],
        status: order[0].status,
        total: `₹${order[0].totalAmount}`,
        items,
        trackingNumber: order[0].trackingNumber,
        estimatedDelivery: order[0].estimatedDelivery?.toISOString().split('T')[0],
        shippingAddress: order[0].shippingAddress,
        paymentMethod: order[0].paymentMethod,
        userId: order[0].userId,
      };

      res.json(orderWithItems);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Create sample orders for testing (you can call this endpoint to populate test data)
  app.post("/api/orders/sample", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Check if user already has orders
      const existingOrders = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.userId, Number(userId)));

      if (existingOrders.length > 0) {
        return res.json({ message: "User already has orders", orders: existingOrders.length });
      }

      // Create sample orders with current dates
      const now = new Date();
      const sampleOrders = [
        {
          userId: Number(userId),
          totalAmount: 1299,
          status: 'delivered' as const,
          paymentMethod: 'Credit Card',
          shippingAddress: '123 Beauty Street, Mumbai, Maharashtra 400001',
          trackingNumber: 'TRK001234567',
          estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          userId: Number(userId),
          totalAmount: 899,
          status: 'shipped' as const,
          paymentMethod: 'UPI',
          shippingAddress: '456 Glow Avenue, Delhi, Delhi 110001',
          trackingNumber: 'TRK001234568',
          estimatedDelivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          userId: Number(userId),
          totalAmount: 1599,
          status: 'processing' as const,
          paymentMethod: 'Net Banking',
          shippingAddress: '789 Skincare Lane, Bangalore, Karnataka 560001',
          trackingNumber: null,
          estimatedDelivery: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        }
      ];

      const createdOrders = await db.insert(ordersTable).values(sampleOrders).returning();

      // Create sample order items
      const sampleItems = [
        // Order 1 items
        {
          orderId: createdOrders[0].id,
          productId: 1,
          productName: 'Vitamin C Face Serum',
          productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          quantity: 1,
          price: '₹699',
        },
        {
          orderId: createdOrders[0].id,
          productId: 2,
          productName: 'Hair Growth Serum',
          productImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          quantity: 1,
          price: '₹599',
        },
        // Order 2 items
        {
          orderId: createdOrders[1].id,
          productId: 3,
          productName: 'Anti-Aging Night Cream',
          productImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          quantity: 1,
          price: '₹899',
        },
        // Order 3 items
        {
          orderId: createdOrders[2].id,
          productId: 4,
          productName: 'Hyaluronic Acid Serum',
          productImage: 'https://images.unsplash.com/photo-1598662779094-110c2bad80b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          quantity: 2,
          price: '₹799',
        }
      ];

      await db.insert(orderItemsTable).values(sampleItems);

      res.json({ message: "Sample orders created successfully", orders: createdOrders.length });
    } catch (error) {
      console.error("Error creating sample orders:", error);
      res.status(500).json({ error: "Failed to create sample orders" });
    }
  });

  // Create new order
  app.post("/api/orders", async (req, res) => {
    try {
      console.log("Received order data:", req.body);
      
      const { userId, totalAmount, status, paymentMethod, shippingAddress, items } = req.body;

      // Validate required fields
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

  // Create sample orders for all users (for testing)
  app.post("/api/orders/create-sample-data", async (req, res) => {
    try {
      // Get all users
      const allUsers = await db.select().from(users);
      
      if (allUsers.length === 0) {
        return res.status(400).json({ error: "No users found. Please create a user account first." });
      }

      let ordersCreated = 0;

      for (const user of allUsers) {
        // Check if user already has orders
        const existingOrders = await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.userId, user.id));

        if (existingOrders.length > 0) {
          continue; // Skip users who already have orders
        }

        // Create sample orders with current dates
        const now = new Date();
        const sampleOrders = [
          {
            userId: user.id,
            totalAmount: 1299,
            status: 'delivered' as const,
            paymentMethod: 'Credit Card',
            shippingAddress: `${user.firstName} ${user.lastName}, 123 Beauty Street, Mumbai, Maharashtra 400001`,
            trackingNumber: `TRK00${user.id}234567`,
            estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            userId: user.id,
            totalAmount: 899,
            status: 'shipped' as const,
            paymentMethod: 'UPI',
            shippingAddress: `${user.firstName} ${user.lastName}, 456 Glow Avenue, Delhi, Delhi 110001`,
            trackingNumber: `TRK00${user.id}234568`,
            estimatedDelivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            userId: user.id,
            totalAmount: 1599,
            status: 'processing' as const,
            paymentMethod: 'Net Banking',
            shippingAddress: `${user.firstName} ${user.lastName}, 789 Skincare Lane, Bangalore, Karnataka 560001`,
            trackingNumber: null,
            estimatedDelivery: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          }
        ];

        const createdOrders = await db.insert(ordersTable).values(sampleOrders).returning();

        // Create sample order items
        const sampleItems = [
          // Order 1 items
          {
            orderId: createdOrders[0].id,
            productId: 1,
            productName: 'Vitamin C Face Serum',
            productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
            quantity: 1,
            price: '₹699',
          },
          {
            orderId: createdOrders[0].id,
            productId: 2,
            productName: 'Hair Growth Serum',
            productImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
            quantity: 1,
            price: '₹599',
          },
          // Order 2 items
          {
            orderId: createdOrders[1].id,
            productId: 3,
            productName: 'Anti-Aging Night Cream',
            productImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
            quantity: 1,
            price: '₹899',
          },
          // Order 3 items
          {
            orderId: createdOrders[2].id,
            productId: 4,
            productName: 'Hyaluronic Acid Serum',
            productImage: 'https://images.unsplash.com/photo-1598662779094-110c2bad80b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
            quantity: 2,
            price: '₹799',
          }
        ];

        await db.insert(orderItemsTable).values(sampleItems);
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


        return res.status(400).json({ error: "Shipping address is required" });
      }

      // Parse and validate totalAmount
      const parsedTotalAmount = Number(totalAmount);
      if (parsedTotalAmount <= 0) {
        return res.status(400).json({ error: "Total amount must be greater than 0" });
      }

      // Create order
      const orderData = {
        userId: Number(userId),
        totalAmount: Math.round(parsedTotalAmount), // Round to nearest integer for database
        status: status || 'pending',
        paymentMethod: paymentMethod || 'Credit Card',
        shippingAddress: shippingAddress.toString(),
        trackingNumber: null,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
      };

      console.log("Creating order with data:", orderData);

      const createdOrders = await db.insert(ordersTable).values(orderData).returning();
      const order = createdOrders[0];

      console.log("Order created:", order);

      // Validate and create order items
      const orderItems = items.map((item: any, index: number) => {
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
          productImage: item.productImage || item.image || '',
          quantity: Number(item.quantity),
          price: item.price.toString(),
        };
      });

      console.log("Creating order items:", orderItems);

      await db.insert(orderItemsTable).values(orderItems);

      // Generate order ID
      const orderId = `ORD-${order.id.toString().padStart(3, '0')}`;

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

  // Update order status (for admin)
  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = req.params.id.replace('ORD-', '');
      const { status, trackingNumber } = req.body;

      const updateData: any = { status };
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }

      await db
        .update(ordersTable)
        .set(updateData)
        .where(eq(ordersTable.id, Number(orderId)));

      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Get order tracking details
  app.get("/api/orders/:id/tracking", async (req, res) => {
    try {
      const orderId = req.params.id.replace('ORD-', '');

      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, Number(orderId)))
        .limit(1);

      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderData = order[0];
      
      // Generate tracking timeline based on order status
      const trackingTimeline = generateTrackingTimeline(orderData.status, orderData.createdAt, orderData.estimatedDelivery);

      const trackingInfo = {
        orderId: `ORD-${orderData.id.toString().padStart(3, '0')}`,
        status: orderData.status,
        trackingNumber: orderData.trackingNumber,
        estimatedDelivery: orderData.estimatedDelivery?.toISOString().split('T')[0],
        timeline: trackingTimeline,
        currentStep: getCurrentStep(orderData.status),
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        createdAt: orderData.createdAt.toISOString().split('T')[0]
      };

      res.json(trackingInfo);
    } catch (error) {
      console.error("Error fetching tracking info:", error);
      res.status(500).json({ error: "Failed to fetch tracking information" });
    }
  });

  // Helper function to generate tracking timeline
  function generateTrackingTimeline(status: string, createdAt: Date, estimatedDelivery: Date | null) {
    const timeline = [
      {
        step: "Order Placed",
        status: "completed",
        date: createdAt.toISOString().split('T')[0],
        time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        description: "Your order has been placed successfully"
      }
    ];

    const orderDate = new Date(createdAt);

    if (status === 'processing' || status === 'shipped' || status === 'delivered') {
      timeline.push({
        step: "Processing",
        status: "completed",
        date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "10:00 AM",
        description: "Your order is being prepared for shipment"
      });
    } else if (status === 'pending') {
      timeline.push({
        step: "Processing",
        status: "pending",
        date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "Expected by 10:00 AM",
        description: "Your order will be processed within 24 hours"
      });
    }

    if (status === 'shipped' || status === 'delivered') {
      timeline.push({
        step: "Shipped",
        status: "completed",
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "02:30 PM",
        description: "Your order has been shipped and is on the way"
      });
    } else if (status === 'processing') {
      timeline.push({
        step: "Shipped",
        status: "pending",
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "Expected by 2:00 PM",
        description: "Your order will be shipped soon"
      });
    }

    if (status === 'delivered') {
      timeline.push({
        step: "Delivered",
        status: "completed",
        date: estimatedDelivery?.toISOString().split('T')[0] || new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "11:45 AM",
        description: "Your order has been delivered successfully"
      });
    } else if (status === 'shipped') {
      timeline.push({
        step: "Delivered",
        status: "pending",
        date: estimatedDelivery?.toISOString().split('T')[0] || new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "Expected delivery",
        description: "Your order is out for delivery"
      });
    }

    return timeline;
  }

  // Helper function to get current step
  function getCurrentStep(status: string): number {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}