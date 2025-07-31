import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { OTPService } from "./otp-service";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc, and, gte, lte, like, isNull, asc, or, sql } from "drizzle-orm";
import { Pool } from "pg";
import { ordersTable, orderItemsTable, users, sliders } from "../shared/schema";
// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/my_pgdb",
});

const db = drizzle(pool);

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'paypal_client_id';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'paypal_client_secret';
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

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
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "OK", 
      message: "API server is running",
      timestamp: new Date().toISOString()
    });
  });

  // Public sliders endpoint for frontend
  app.get('/api/sliders', async (req, res) => {
    try {
      const activeSliders = await db
        .select()
        .from(sliders)
        .where(eq(sliders.isActive, true))
        .orderBy(asc(sliders.sortOrder));

      res.json(activeSliders);
    } catch (error) {
      console.error('Error fetching public sliders:', error);
      console.log("Database unavailable, using sample slider data");


    }
  });

  // Firebase auth verification middleware
  const verifyFirebaseToken = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No Firebase token provided" });
      }

      const token = authHeader.substring(7);

      // In a real implementation, you would verify the Firebase token here
      // For now, we'll just decode and trust it
      console.log("Firebase token received:", token.substring(0, 20) + "...");

      // Store user info in request for later use
      req.firebaseUser = { token };
      next();
    } catch (error) {
      console.error("Firebase token verification error:", error);
      res.status(401).json({ error: "Invalid Firebase token" });
    }
  };

  // Firebase authentication endpoint
  app.post("/api/auth/firebase", verifyFirebaseToken, async (req, res) => {
    try {
      const { uid, email, displayName, phoneNumber, photoURL } = req.body;

      // Check if user exists in our database
      let user = await storage.getUserByEmail(email || `${uid}@firebase.user`);

      if (!user) {
        // Create new user from Firebase data
        user = await storage.createUser({
          firstName: displayName ? displayName.split(' ')[0] : 'Firebase',
          lastName: displayName ? displayName.split(' ').slice(1).join(' ') || 'User' : 'User',
          email: email || `${uid}@firebase.user`,
          phone: phoneNumber || null,
          password: 'firebase_auth', // Placeholder since Firebase handles auth
          firebaseUid: uid
        });
      }

      // Generate JWT token for our app
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Return user data and token
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
        { userId: user.id, email: user.email, role: user.role },
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
        { userId: user.id, email: user.email, role: user.role },
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

  // Mobile OTP routes
  app.post("/api/auth/send-mobile-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Basic phone number validation
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
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

  app.post("/api/auth/verify-mobile-otp", async (req, res) => {
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

  // Get current mobile OTP for development
  app.get("/api/auth/get-mobile-otp/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const otpData = OTPService.otpStorage.get(phoneNumber);

      if (otpData && new Date() <= otpData.expiresAt) {
        res.json({ otp: otpData.otp });
      } else {
        res.status(404).json({ error: "No valid OTP found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get OTP" });
    }
  });

  // Profile update endpoint
  app.put("/api/users/:id", async (req, res) => {
    try {
      console.log(`PUT /api/users/${req.params.id} - Request received`);
      console.log('Request body:', req.body);
      console.log('Request headers:', req.headers);

      // Set content type to ensure JSON response
      res.setHeader('Content-Type', 'application/json');

      const { id } = req.params;
      const { firstName, lastName, phone } = req.body;

      console.log(`Updating user ${id} with:`, { firstName, lastName, phone });

      // Validation
      if (!firstName || !lastName) {
        return res.status(400).json({ error: "First name and last name are required" });
      }

      // Validate ID
      const userId = parseInt(id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Update user in database
      const updatedUser = await storage.updateUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : null
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("User updated successfully:", updatedUser);

      // Return updated user data (without password)
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

  // Change password endpoint
  app.put("/api/users/:id/password", async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      // Get user
      const user = await storage.getUserById(parseInt(id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await storage.updateUserPassword(parseInt(id), hashedNewPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
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
      console.log("Database unavailable, using sample product data");
      res.json(generateSampleProducts());
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.log("Database unavailable, using sample featured products");
      const sampleProducts = generateSampleProducts();
      res.json(sampleProducts.filter(p => p.featured));
    }
  });

  app.get("/api/products/bestsellers", async (req, res) => {
    try {
      const products = await storage.getBestsellerProducts();
      res.json(products);
    } catch (error) {
      console.log("Database unavailable, using sample bestseller products");
      const sampleProducts = generateSampleProducts();
      res.json(sampleProducts.filter(p => p.bestseller));
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
      
      // Get all products first
      const allProducts = await storage.getProducts();
      
      // Filter products by category with flexible matching
      const filteredProducts = allProducts.filter(product => {
        if (!product.category) return false;
        
        const productCategory = product.category.toLowerCase();
        const searchCategory = category.toLowerCase();
        
        // Exact match
        if (productCategory === searchCategory) return true;
        
        // Partial match
        if (productCategory.includes(searchCategory) || searchCategory.includes(productCategory)) return true;
        
        // Special category mappings
        const categoryMappings: Record<string, string[]> = {
          'skincare': ['skin', 'face', 'facial'],
          'haircare': ['hair'],
          'makeup': ['cosmetics', 'beauty'],
          'bodycare': ['body'],
          'eyecare': ['eye', 'eyes'],
          'eye-drama': ['eye', 'eyes', 'eyecare'],
          'beauty': ['makeup', 'cosmetics', 'skincare'],
        };
        
        const mappedCategories = categoryMappings[searchCategory] || [];
        return mappedCategories.some(mapped => productCategory.includes(mapped));
      });
      
      res.json(filteredProducts);
    } catch (error) {
      console.log("Database unavailable, using sample product data with category filter");
      const sampleProducts = generateSampleProducts();
      const { category } = req.params;
      const searchCategory = category.toLowerCase();
      
      const filteredSampleProducts = sampleProducts.filter(product => {
        const productCategory = product.category.toLowerCase();
        return productCategory.includes(searchCategory) || 
               searchCategory.includes(productCategory) ||
               (searchCategory.includes('eye') && productCategory.includes('makeup')) ||
               (searchCategory.includes('beauty') && ['skincare', 'makeup'].some(cat => productCategory.includes(cat)));
      });
      
      res.json(filteredSampleProducts);
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

      // Update product count for each category dynamically
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const products = await storage.getProductsByCategory(category.name);
          return {
            ...category,
            productCount: products.length
          };
        })
      );

      res.json(categoriesWithCount);
    } catch (error) {
      console.log("Database unavailable, using sample category data");
      res.json(generateSampleCategories());
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
      console.log("Database unavailable, using sample subcategory data");
      res.json(generateSampleSubcategories());
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
      let orders;
      try {
        orders = await db
          .select()
          .from(ordersTable)
          .orderBy(desc(ordersTable.createdAt));
      } catch (dbError) {
        // Fallback sample data when database is unavailable
        console.log("Database unavailable, using sample data");
        const sampleOrders = generateSampleOrders();
        return res.json(sampleOrders);
      }

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
          productImage: 'https://images.unsplash.com/photo-1598662779094-110c2bad80b5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
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

  

  // Get PayPal access token
  const getPayPalAccessToken = async () => {
    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
      
      const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('PayPal access token error:', error);
      throw new Error('Failed to get PayPal access token');
    }
  };

  // Create PayPal order
  app.post("/api/payments/paypal/create-order", async (req, res) => {
    try {
      const { amount, currency = 'USD', customerInfo } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      // Check PayPal configuration
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET || 
          process.env.PAYPAL_CLIENT_ID === 'paypal_client_id' || 
          process.env.PAYPAL_CLIENT_SECRET === 'paypal_client_secret') {
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
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
          description: 'Beauty Store Purchase',
          shipping: {
            name: {
              full_name: customerInfo?.name || 'Customer',
            },
            address: {
              address_line_1: customerInfo?.address || '',
              admin_area_2: customerInfo?.city || '',
              admin_area_1: customerInfo?.state || '',
              postal_code: customerInfo?.zipCode || '',
              country_code: 'US',
            },
          },
        }],
        application_context: {
          return_url: `${req.protocol}://${req.get('host')}/api/payments/paypal/success`,
          cancel_url: `${req.protocol}://${req.get('host')}/api/payments/paypal/cancel`,
          brand_name: 'Beauty Store',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
        },
      };

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
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

      const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;

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
        currency: orderData.purchase_units[0].amount.currency_code,
      });
    } catch (error) {
      console.error("PayPal order creation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to create PayPal order",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // PayPal payment success callback
  app.get("/api/payments/paypal/success", async (req, res) => {
    try {
      const { token, PayerID } = req.query;

      if (!token || !PayerID) {
        return res.redirect('/checkout?payment=failed');
      }

      const accessToken = await getPayPalAccessToken();

      // Capture the payment
      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const captureData = await response.json();

      if (response.ok && captureData.status === 'COMPLETED') {
        res.redirect('/checkout?payment=success');
      } else {
        res.redirect('/checkout?payment=failed');
      }
    } catch (error) {
      console.error("PayPal capture error:", error);
      res.redirect('/checkout?payment=failed');
    }
  });

  // PayPal payment cancel callback
  app.get("/api/payments/paypal/cancel", (req, res) => {
    res.redirect('/checkout?payment=cancelled');
  });

  // Verify PayPal payment
  app.post("/api/payments/paypal/verify", async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      const accessToken = await getPayPalAccessToken();

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const orderData = await response.json();

      if (response.ok && orderData.status === 'COMPLETED') {
        res.json({ verified: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    } catch (error) {
      console.error("PayPal verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
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

  // Generate sample orders for development
  function generateSampleOrders() {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const customers = [
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43210' },
      { name: 'Arjun Patel', email: 'arjun@example.com', phone: '+91 87654 32109' },
      { name: 'Meera Reddy', email: 'meera@example.com', phone: '+91 76543 21098' },
      { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 65432 10987' },
      { name: 'Ananya Singh', email: 'ananya@example.com', phone: '+91 54321 09876' }
    ];

    const products = [
      { name: 'Vitamin C Face Serum', price: '₹699', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300' },
      { name: 'Hair Growth Serum', price: '₹599', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300' },
      { name: 'Anti-Aging Night Cream', price: '₹899', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300' },
      { name: 'Hyaluronic Acid Serum', price: '₹799', image: 'https://images.unsplash.com/photo-1598662779094-110c2bad80b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300' },
      { name: 'Niacinamide Serum', price: '₹549', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300' }
    ];

    const orders = [];
    const now = new Date();

    // Generate orders for the past year
    for (let i = 0; i < 50; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);

      // Generate 1-3 products per order
      const orderProducts = [];
      const numProducts = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;

      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseInt(product.price.replace(/[₹,]/g, ''));

        orderProducts.push({
          ...product,
          quantity,
        });

        totalAmount += price * quantity;
      }

      orders.push({
        id: `ORD-${(i + 1).toString().padStart(3, '0')}`,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: `${customer.name}, ${Math.floor(Math.random() * 999) + 1} Sample Street, Mumbai, Maharashtra 400001`,
        },
        date: orderDate.toISOString().split('T')[0],
        total: `₹${totalAmount}`,
        totalAmount,
        status,
        items: orderProducts.length,
        paymentMethod: ['Credit Card', 'UPI', 'Net Banking'][Math.floor(Math.random() * 3)],
        trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${Math.random().toString(36).substring(7).toUpperCase()}` : null,
        estimatedDelivery: status === 'shipped' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        products: orderProducts,
        userId: Math.floor(Math.random() * 5) + 1,
        shippingAddress: `${customer.name}, ${Math.floor(Math.random() * 999) + 1} Sample Street, Mumbai, Maharashtra 400001`,
      });
    }

    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Generate sample subcategories for development
  function generateSampleSubcategories() {
    return [
      {
        id: 1,
        name: "Face Serums",
        slug: "face-serums",
        description: "Concentrated treatments for specific skin concerns",
        categoryId: 1,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Moisturizers",
        slug: "moisturizers",
        description: "Hydrating creams and lotions for daily skincare",
        categoryId: 1,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: "Cleansers",
        slug: "cleansers",
        description: "Gentle cleansing products for daily use",
        categoryId: 1,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        name: "Hair Serums",
        slug: "hair-serums",
        description: "Treatments for hair growth and strength",
        categoryId: 2,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        name: "Hair Oils",
        slug: "hair-oils",
        description: "Nourishing oils for hair care",
        categoryId: 2,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 6,
        name: "Shampoos",
        slug: "shampoos",
        description: "Cleansing shampoos for all hair types",
        categoryId: 2,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 7,
        name: "Lipsticks",
        slug: "lipsticks",
        description: "Color and care for your lips",
        categoryId: 3,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 8,
        name: "Foundations",
        slug: "foundations",
        description: "Base makeup for flawless coverage",
        categoryId: 3,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 9,
        name: "Eye Makeup",
        slug: "eye-makeup",
        description: "Enhance your eyes with our makeup range",
        categoryId: 3,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 10,
        name: "Body Lotions",
        slug: "body-lotions",
        description: "Moisturizing lotions for soft skin",
        categoryId: 4,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 11,
        name: "Body Scrubs",
        slug: "body-scrubs",
        description: "Exfoliating scrubs for smooth skin",
        categoryId: 4,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Generate sample categories for development with dynamic product count
  function generateSampleCategories() {
    const sampleProducts = generateSampleProducts();

    const baseCategories = [
      {
        id: 1,
        name: "Skincare",
        slug: "skincare",
        description: "Premium skincare products for healthy, glowing skin",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Haircare",
        slug: "haircare",
        description: "Nourishing hair care products for all hair types",
        imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: "Makeup",
        slug: "makeup",
        description: "High-quality makeup products for every occasion",
        imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        name: "Body Care",
        slug: "bodycare",
        description: "Luxurious body care essentials for daily pampering",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Calculate dynamic product count for each category
    return baseCategories.map(category => {
      const productCount = sampleProducts.filter(product => 
        product.category.toLowerCase() === category.slug.toLowerCase()
      ).length;

      return {
        ...category,
        productCount
      };
    });
  }

  // Generate sample customers for development
  function generateSampleCustomers() {
    const sampleCustomers = [
      { id: 1, firstName: 'Priya', lastName: 'Sharma', email: 'priya@example.com', phone: '+91 98765 43210' },
      { id: 2, firstName: 'Arjun', lastName: 'Patel', email: 'arjun@example.com', phone: '+91 87654 32109' },
      { id: 3, firstName: 'Meera', lastName: 'Reddy', email: 'meera@example.com', phone: '+91 76543 21098' },
      { id: 4, firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@example.com', phone: '+91 65432 10987' },
      { id: 5, firstName: 'Ananya', lastName: 'Singh', email: 'ananya@example.com', phone: '+91 54321 09876' }
    ];

    return sampleCustomers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      orders: Math.floor(Math.random() * 10) + 1,
      spent: `₹${(Math.random() * 5000 + 500).toFixed(2)}`,
      status: Math.random() > 0.7 ? 'VIP' : Math.random() > 0.4 ? 'Active' : 'New',
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      firstName: customer.firstName,
      lastName: customer.lastName,
    }));
  }

  // Generate sample products for development
  function generateSampleProducts() {
    return [
      {
        id: 1,
        name: 'Vitamin C Face Serum',
        slug: 'vitamin-c-face-serum',
        description: 'Brighten and rejuvenate your skin with our potent Vitamin C serum.',
        shortDescription: 'Brighten and rejuvenate your skin',
        price: 699,
        originalPrice: 899,
        category: 'Skincare',
        subcategory: 'face-serums',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.5,
        reviewCount: 128,
        inStock: true,
        featured: true,
        bestseller: true,
        newLaunch: false,
        saleOffer: '22% OFF',
        variants: '30ml, 60ml',
        ingredients: 'Vitamin C, Hyaluronic Acid, Niacinamide',
        benefits: 'Brightens skin, reduces dark spots, anti-aging',
        howToUse: 'Apply 2-3 drops on clean face, morning and evening',
        size: '30ml',
        tags: 'vitamin-c,serum,brightening,anti-aging'
      },
      {
        id: 2,
        name: 'Hyaluronic Acid Serum',
        slug: 'hyaluronic-acid-serum',
        description: 'Deep hydration serum for plump, moisturized skin.',
        shortDescription: 'Intense hydration for all skin types',
        price: 549,
        originalPrice: 699,
        category: 'Skincare',
        subcategory: 'face-serums',
        imageUrl: 'https://images.unsplash.com/photo-1598662779094-110c2bad80b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.4,
        reviewCount: 95,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: '21% OFF',
        variants: '30ml, 60ml',
        ingredients: 'Hyaluronic Acid, Vitamin B5, Aloe Vera',
        benefits: 'Deep hydration, plumps skin, reduces fine lines',
        howToUse: 'Apply to damp skin, follow with moisturizer',
        size: '30ml',
        tags: 'hydration,hyaluronic-acid,serum,moisturizing'
      },
      {
        id: 3,
        name: 'Anti-Aging Night Cream',
        slug: 'anti-aging-night-cream',
        description: 'Restore and rejuvenate your skin overnight with our premium night cream.',
        shortDescription: 'Restore and rejuvenate overnight',
        price: 899,
        originalPrice: 1199,
        category: 'Skincare',
        subcategory: 'moisturizers',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.7,
        reviewCount: 156,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: true,
        saleOffer: '25% OFF',
        variants: '50ml, 100ml',
        ingredients: 'Retinol, Peptides, Hyaluronic Acid',
        benefits: 'Reduces wrinkles, improves skin texture, hydrates',
        howToUse: 'Apply on clean face before bed, avoid eye area',
        size: '50ml',
        tags: 'anti-aging,retinol,night-cream,moisturizer'
      },
      {
        id: 4,
        name: 'Niacinamide Serum',
        slug: 'niacinamide-serum',
        description: 'Minimize pores and control oil with this powerful niacinamide serum.',
        shortDescription: 'Pore minimizing and oil control',
        price: 449,
        originalPrice: 599,
        category: 'Skincare',
        subcategory: 'Serums',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.3,
        reviewCount: 78,
        inStock: true,
        featured: false,
        bestseller: false,
        newLaunch: true,
        saleOffer: '25% OFF',
        variants: '30ml',
        ingredients: 'Niacinamide, Zinc, Hyaluronic Acid',
        benefits: 'Minimizes pores, controls oil, evens skin tone',
        howToUse: 'Apply twice daily to clean skin',
        size: '30ml',
        tags: 'niacinamide,pore-minimizing,oil-control,serum'
      },
      {
        id: 5,
        name: 'Hair Growth Serum',
        slug: 'hair-growth-serum',
        description: 'Stimulate hair growth and strengthen hair follicles with our advanced formula.',
        shortDescription: 'Stimulate hair growth and strengthen',
        price: 599,
        originalPrice: 799,
        category: 'Haircare',
        subcategory: 'Serums',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.2,
        reviewCount: 89,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: '25% OFF',
        variants: '50ml, 100ml',
        ingredients: 'Minoxidil, Caffeine, Biotin',
        benefits: 'Promotes hair growth, strengthens hair, reduces hair fall',
        howToUse: 'Apply to scalp, massage gently, leave overnight',
        size: '50ml',
        tags: 'hair-growth,serum,biotin,minoxidil'
      },
      {
        id: 6,
        name: 'Nourishing Hair Oil',
        slug: 'nourishing-hair-oil',
        description: 'Deep conditioning hair oil with natural ingredients for healthy, shiny hair.',
        shortDescription: 'Deep conditioning for healthy hair',
        price: 399,
        originalPrice: 499,
        category: 'Haircare',
        subcategory: 'Oils',
        imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.5,
        reviewCount: 112,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: false,
        saleOffer: '20% OFF',
        variants: '100ml, 200ml',
        ingredients: 'Argan Oil, Coconut Oil, Vitamin E',
        benefits: 'Nourishes hair, adds shine, reduces frizz',
        howToUse: 'Apply to damp hair, leave for 30 minutes, then wash',
        size: '100ml',
        tags: 'hair-oil,nourishing,argan,coconut'
      },
      {
        id: 7,
        name: 'Matte Liquid Lipstick',
        slug: 'matte-liquid-lipstick',
        description: 'Long-lasting matte liquid lipstick with intense color payoff.',
        shortDescription: 'Long-lasting matte finish',
        price: 299,
        originalPrice: 399,
        category: 'Makeup',
        subcategory: 'Lips',
        imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.3,
        reviewCount: 67,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: '25% OFF',
        variants: 'Red, Pink, Berry, Nude',
        ingredients: 'Vitamin E, Jojoba Oil, Natural Waxes',
        benefits: 'Long-lasting, transfer-proof, comfortable wear',
        howToUse: 'Apply evenly to lips, allow to dry',
        size: '6ml',
        tags: 'lipstick,matte,liquid,long-lasting'
      },
      {
        id: 8,
        name: 'HD Foundation',
        slug: 'hd-foundation',
        description: 'High-definition foundation for flawless, natural-looking coverage.',
        shortDescription: 'Flawless natural coverage',
        price: 799,
        originalPrice: 999,
        category: 'Makeup',
        subcategory: 'Face',
        imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.4,
        reviewCount: 89,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: false,
        saleOffer: '20% OFF',
        variants: 'Fair, Light, Medium, Deep',
        ingredients: 'Hyaluronic Acid, SPF 15, Vitamin C',
        benefits: 'Full coverage, long-lasting, buildable',
        howToUse: 'Apply with brush or sponge, blend well',
        size: '30ml',
        tags: 'foundation,hd,coverage,makeup'
      },
      {
        id: 9,
        name: 'Body Butter',
        slug: 'body-butter',
        description: 'Rich, nourishing body butter for deep moisturization.',
        shortDescription: 'Deep moisturization for soft skin',
        price: 349,
        originalPrice: 449,
        category: 'Body Care',
        subcategory: 'Moisturizers',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.6,
        reviewCount: 134,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: '22% OFF',
        variants: 'Vanilla, Coconut, Lavender',
        ingredients: 'Shea Butter, Cocoa Butter, Vitamin E',
        benefits: 'Deep moisturization, long-lasting softness',
        howToUse: 'Apply to clean, dry skin, massage gently',
        size: '200ml',
        tags: 'body-butter,moisturizer,shea,cocoa'
      },
      {
        id: 10,
        name: 'Exfoliating Body Scrub',
        slug: 'exfoliating-body-scrub',
        description: 'Gentle exfoliating scrub to reveal smooth, glowing skin.',
        shortDescription: 'Gentle exfoliation for smooth skin',
        price: 249,
        originalPrice: 329,
        category: 'Body Care',
        subcategory: 'Exfoliants',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.2,
        reviewCount: 76,
        inStock: true,
        featured: false,
        bestseller: false,
        newLaunch: true,
        saleOffer: '24% OFF',
        variants: 'Coffee, Sugar, Sea Salt',
        ingredients: 'Natural Exfoliants, Coconut Oil, Vitamin E',
        benefits: 'Removes dead skin, improves texture, moisturizes',
        howToUse: 'Apply to wet skin, massage in circular motions, rinse',
        size: '300ml',
        tags: 'body-scrub,exfoliant,coffee,sugar'
      },
      {
        id: 11,
        name: 'Eye Drama Mascara',
        slug: 'eye-drama-mascara',
        description: 'Volumizing mascara for dramatic, bold lashes.',
        shortDescription: 'Dramatic volume for bold lashes',
        price: 399,
        originalPrice: 549,
        category: 'Eye Care',
        subcategory: 'Eye Makeup',
        imageUrl: 'https://images.unsplash.com/photo-1583847427292-a9695a5cf4c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.6,
        reviewCount: 142,
        inStock: true,
        featured: true,
        bestseller: true,
        newLaunch: false,
        saleOffer: '27% OFF',
        variants: 'Black, Brown, Blue',
        ingredients: 'Vitamin E, Keratin, Natural Waxes',
        benefits: 'Volumizes lashes, long-lasting, waterproof',
        howToUse: 'Apply from root to tip in zigzag motion',
        size: '12ml',
        tags: 'mascara,eye-makeup,volume,drama'
      },
      {
        id: 12,
        name: 'Eye Cream Anti-Aging',
        slug: 'eye-cream-anti-aging',
        description: 'Intensive eye cream to reduce dark circles and fine lines.',
        shortDescription: 'Reduces dark circles and fine lines',
        price: 799,
        originalPrice: 999,
        category: 'Eye Care',
        subcategory: 'Eye Treatment',
        imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.5,
        reviewCount: 98,
        inStock: true,
        featured: false,
        bestseller: true,
        newLaunch: false,
        saleOffer: '20% OFF',
        variants: '15ml, 30ml',
        ingredients: 'Retinol, Hyaluronic Acid, Caffeine',
        benefits: 'Reduces dark circles, anti-aging, hydrates',
        howToUse: 'Gently pat around eye area morning and night',
        size: '15ml',
        tags: 'eye-cream,anti-aging,dark-circles,retinol'
      },
      {
        id: 13,
        name: 'Beauty Blender Set',
        slug: 'beauty-blender-set',
        description: 'Professional makeup sponges for flawless application.',
        shortDescription: 'Professional makeup sponges',
        price: 299,
        originalPrice: 399,
        category: 'Beauty',
        subcategory: 'Tools',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.4,
        reviewCount: 156,
        inStock: true,
        featured: false,
        bestseller: false,
        newLaunch: true,
        saleOffer: '25% OFF',
        variants: 'Pink, Orange, Purple',
        ingredients: 'Non-latex foam, Antimicrobial',
        benefits: 'Seamless blending, reusable, easy to clean',
        howToUse: 'Dampen sponge, squeeze out excess water, blend makeup',
        size: 'Set of 3',
        tags: 'beauty-blender,makeup-tools,sponge,blending'
      },
      {
        id: 14,
        name: 'Eye Shadow Palette',
        slug: 'eye-shadow-palette',
        description: '12 stunning shades for dramatic eye looks.',
        shortDescription: '12 shades for dramatic eyes',
        price: 599,
        originalPrice: 799,
        category: 'Eye Care',
        subcategory: 'Eye Makeup',
        imageUrl: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        rating: 4.7,
        reviewCount: 189,
        inStock: true,
        featured: true,
        bestseller: false,
        newLaunch: false,
        saleOffer: '25% OFF',
        variants: 'Warm Tones, Cool Tones, Neutral',
        ingredients: 'Mica, Talc, Vitamin E',
        benefits: 'High pigmentation, long-lasting, blendable',
        howToUse: 'Apply with brush, blend well',
        size: '12 x 2g',
        tags: 'eyeshadow,palette,eye-makeup,pigmented'
      }
    ];
  }

  // Admin Customers endpoints
  app.get("/api/admin/customers", async (req, res) => {
    try {
      // Get all users from database
      let allUsers;
      try {
        allUsers = await db.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          createdAt: users.createdAt,
        }).from(users);
      } catch (dbError) {
        // Fallback sample data when database is unavailable
        console.log("Database unavailable, using sample customer data");
        return res.json(generateSampleCustomers());
      }

      // Get order statistics for each customer
      const customersWithStats = await Promise.all(
        allUsers.map(async (user) => {
          // Get order count and total spent for this user
          const userOrders = await db
            .select({
              totalAmount: ordersTable.totalAmount,
              status: ordersTable.status,
            })
            .from(ordersTable)
            .where(eq(ordersTable.userId, user.id));

          const orderCount = userOrders.length;
          const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);

          // Determine customer status based on orders and total spent
          let status = 'New';
          if (orderCount === 0) {
            status = 'Inactive';
          } else if (totalSpent > 2000) {
            status = 'VIP';
          } else if (orderCount > 0) {
            status = 'Active';
          }

          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || 'N/A',
            orders: orderCount,
            spent: `₹${totalSpent.toFixed(2)}`,
            status,
            joinedDate: user.createdAt.toISOString().split('T')[0],
            firstName: user.firstName,
            lastName: user.lastName,
          };
        })
      );

      res.json(customersWithStats);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Get individual customer details
  app.get("/api/admin/customers/:id", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);

      // Get user details
      const user = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, customerId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const customer = user[0];

      // Get customer's orders
      const customerOrders = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.userId, customerId))
        .orderBy(desc(ordersTable.createdAt));

      const orderCount = customerOrders.length;
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Determine status
      let status = 'New';
      if (orderCount === 0) {
        status = 'Inactive';
      } else if (totalSpent > 2000) {
        status = 'VIP';
      } else if (orderCount > 0) {
        status = 'Active';
      }

      const customerWithStats = {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone || 'N/A',
        orders: orderCount,
        spent: `₹${totalSpent.toFixed(2)}`,
        status,
        joinedDate: customer.createdAt.toISOString().split('T')[0],
        firstName: customer.firstName,
        lastName: customer.lastName,
        recentOrders: customerOrders.slice(0, 5).map(order => ({
          id: `ORD-${order.id.toString().padStart(3, '0')}`,
          date: order.createdAt.toISOString().split('T')[0],
          status: order.status,
          total: `₹${order.totalAmount}`,
        })),
      };

      res.json(customerWithStats);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer details" });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ error: "All required fields must be provided" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
      }

      // Save contact form submission to database
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

      // In a real application, you would also:
      // // 1. Send anemail notification to your support team
      // 2. Send a confirmation email to the customer

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

  // Contact submissions management endpoints (Admin)
  app.get("/api/admin/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ error: "Failed to fetch contact submissions" });
    }
  });

  app.get("/api/admin/contact-submissions/:id", async (req, res) => {
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

  app.put("/api/admin/contact-submissions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["unread", "read", "responded"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be: unread, read, or responded" });
      }

      const respondedAt = status === "responded" ? new Date() : undefined;
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

  app.delete("/api/admin/contact-submissions/:id", async (req, res) => {
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

  // Invoice download endpoint
  app.get("/api/orders/:id/invoice", async (req, res) => {
    try {
      const orderId = req.params.id.replace('ORD-', '');

      // Get order details
      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, Number(orderId)))
        .limit(1);

      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get order items
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

      // Get user info
      const user = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
        })
        .from(users)
        .where(eq(users.id, order[0].userId))
        .limit(1);

      const userData = user[0] || { firstName: 'Unknown', lastName: 'Customer', email: 'unknown@email.com', phone: 'N/A' };

      // Generate HTML invoice
      const invoiceHtml = generateInvoiceHTML({
        order: order[0],
        items,
        customer: userData,
        orderId: `ORD-${order[0].id.toString().padStart(3, '0')}`
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-ORD-${order[0].id.toString().padStart(3, '0')}.html"`);

      res.send(invoiceHtml);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ error: "Failed to generate invoice" });
    }
  });

  // Helper function to generate invoice HTML
  function generateInvoiceHTML({ order, items, customer, orderId }: any) {
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = parseInt(item.price.replace(/[₹,]/g, ""));
      return sum + (price * item.quantity);
    }, 0);

    const tax = Math.round(subtotal * 0.18); // 18% GST
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
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                <p><strong>Status:</strong> <span class="status-badge">${order.status}</span></p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
            </div>

            <div class="info-section customer-info">
                <h3>Bill To</h3>
                <p><strong>${customer.firstName} ${customer.lastName}</strong></p>
                <p>${customer.email}</p>
                ${customer.phone ? `<p>${customer.phone}</p>` : ''}
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
                ${items.map((item: any) => {
                  const unitPrice = parseInt(item.price.replace(/[₹,]/g, ""));
                  const itemTotal = unitPrice * item.quantity;
                  return `
                    <tr>
                        <td>${item.name}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹${unitPrice.toLocaleString('en-IN')}</td>
                        <td class="text-right">₹${itemTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td>GST (18%):</td>
                    <td class="text-right">₹${tax.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td>Shipping:</td>
                    <td class="text-right">Free</td>
                </tr>
                <tr class="grand-total">
                    <td><strong>Grand Total:</strong></td>
                    <td class="text-right"><strong>₹${total.toLocaleString('en-IN')}</strong></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>This is a computer generated invoice. No signature required.</p>
            <p>For any queries, please contact us at support@beautystore.com</p>
            <p>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
        </div>
    </div>
</body>
</html>`;
  }

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q;

      if (!query || query.trim().length === 0) {
        return res.json([]);
      }

      const products = await storage.searchProducts(query);
      return res.json(products);

    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  // Admin global search endpoint
  // Token validation endpoint
  app.get("/api/auth/validate", (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No valid token provided" });
      }

      const token = authHeader.substring(7);

      // Verify JWT token
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

  app.get("/api/admin/search", async (req, res) => {
    try {
      const query = req.query.q;

      if (!query || query.toString().trim().length === 0) {
        return res.json({ products: [], customers: [], orders: [] });
      }

      console.log("Admin search query:", query);

      const searchTerm = query.toString().toLowerCase();

      // Search products
      let products = [];
      try {
        const allProducts = await storage.getProducts();
        products = allProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm)) ||
          (product.tags && product.tags.toLowerCase().includes(searchTerm))
        ).slice(0, 5);
      } catch (error) {
        console.log("Products search failed:", error.message);
        products = [];
      }

      // Search customers
      let customers = [];
      try {
        const allUsers = await db.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          createdAt: users.createdAt,
        }).from(users);

        customers = allUsers.filter(user => 
          (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
          (user.email && user.email.toLowerCase().includes(searchTerm)) ||
          `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm)
        ).map(user => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          phone: user.phone || 'N/A'
        })).slice(0, 5);
      } catch (error) {
        console.log("Customers search failed:", error.message);
        customers = [];
      }

      // Search orders
      let orders = [];
      try {
        const allOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

        orders = await Promise.all(
          allOrders.filter(order => {
            const orderId = `ORD-${order.id.toString().padStart(3, '0')}`;
            return orderId.toLowerCase().includes(searchTerm) ||
                   (order.status && order.status.toLowerCase().includes(searchTerm));
          }).slice(0, 5).map(async (order) => {
            try {
              // Get user info for the order
              const user = await db
                .select({
                  firstName: users.firstName,
                  lastName: users.lastName,
                  email: users.email,
                })
                .from(users)
                .where(eq(users.id, order.userId))
                .limit(1);

              const userData = user[0] || { firstName: 'Unknown', lastName: 'Customer', email: 'unknown@email.com' };

              return {
                id: `ORD-${order.id.toString().padStart(3, '0')}`,
                customerName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown Customer',
                customerEmail: userData.email,
                date: order.createdAt.toISOString().split('T')[0],
                status: order.status,
                total: `₹${order.totalAmount}`
              };
            } catch (userError) {
              console.log("Error fetching user for order:", order.id);
              return {
                id: `ORD-${order.id.toString().padStart(3, '0')}`,
                customerName: 'Unknown Customer',
                customerEmail: 'unknown@email.com',
                date: order.createdAt.toISOString().split('T')[0],
                status: order.status,
                total: `₹${order.totalAmount}`
              };
            }
          })
        );
      } catch (error) {
        console.log("Orders search failed:", error.message);
        orders = [];
      }

      res.json({ products, customers, orders });
    } catch (error) {
      console.error("Admin search error:", error);
      res.status(500).json({ error: "Failed to perform admin search" });
    }
  });

  // Shades API
  app.get("/api/shades", async (req, res) => {
    try {
      const activeShades = await storage.getActiveShades();
      res.json(activeShades);
    } catch (error) {
      console.log("Database unavailable, using sample shade data");
      // Default shades data
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

  // Admin shade management routes
  app.get("/api/admin/shades", async (req, res) => {
    try {
      const allShades = await storage.getShades();
      res.json(allShades);
    } catch (error) {
      console.error("Error fetching shades:", error);
      res.status(500).json({ error: "Failed to fetch shades" });
    }
  });

  app.post("/api/admin/shades", async (req, res) => {
    try {
      const { name, colorCode, value, isActive, sortOrder } = req.body;

      if (!name || !colorCode || !value) {
        return res.status(400).json({ error: "Name, color code, and value are required" });
      }

      const shadeData = {
        name: name.trim(),
        colorCode: colorCode.trim(),
        value: value.trim().toLowerCase().replace(/\s+/g, '-'),
        isActive: Boolean(isActive ?? true),
        sortOrder: Number(sortOrder) || 0
      };

      const shade = await storage.createShade(shadeData);
      res.status(201).json(shade);
    } catch (error) {
      console.error("Error creating shade:", error);
      res.status(500).json({ error: "Failed to create shade" });
    }
  });

  app.put("/api/admin/shades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedShade = await storage.updateShade(parseInt(id), req.body);
      if (!updatedShade) {
        return res.status(404).json({ error: "Shade not found" });
      }
      res.json(updatedShade);
    } catch (error) {
      console.error("Error updating shade:", error);
      res.status(500).json({ error: "Failed to update shade" });
    }
  });

  app.delete("/api/admin/shades/:id", async (req, res) => {
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

  // Slider management routes
  app.get('/api/admin/sliders', async (req, res) => {
    try {
      const allSliders = await db.select().from(sliders).orderBy(desc(sliders.sortOrder));
      res.json(allSliders);
    } catch (error) {
      console.error('Error fetching sliders:', error);
      res.status(500).json({ error: 'Failed to fetch sliders' });
    }
  });

  app.post('/api/admin/sliders', upload.single("image"), async (req, res) => {
    try {
      // Handle image URL - require uploaded file
      if (!req.file) {
        return res.status(400).json({ 
          error: 'Image file is required' 
        });
      }

      const imageUrl = `/api/images/${req.file.filename}`;

      const [newSlider] = await db.insert(sliders).values({
        title: `Image ${Date.now()}`,
        subtitle: '',
        description: 'Uploaded image',
        imageUrl: imageUrl,
        badge: '',
        primaryActionText: '',
        primaryActionUrl: '',
        isActive: true,
        sortOrder: 0
      }).returning();

      res.json(newSlider);
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ 
        error: 'Failed to upload image',
        details: error.message 
      });
    }
  });

  app.put('/api/admin/sliders/:id', upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const body = req.body;

       // Return the file URL
       let imageUrl = body.imageUrl;
       if(req.file) {
        imageUrl = `/api/images/${req.file?.filename}`;
       }

      const [updatedSlider] = await db.update(sliders)
        .set({

          imageUrl: imageUrl,
          isActive: body.isActive === 'true',
          sortOrder: parseInt(body.sortOrder, 10),
          updatedAt: new Date().toISOString()
        })
        .where(eq(sliders.id, id))
        .returning();

      if (!updatedSlider) {
        return res.status(404).json({ error: 'Slider not found' });
      }

      res.json(updatedSlider);
    } catch (error) {
      console.error('Error updating slider:', error);
      res.status(500).json({ error: 'Failed to update slider' });
    }
  });

  app.delete('/api/admin/sliders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const [deletedSlider] = await db.delete(sliders)
        .where(eq(sliders.id, id))
        .returning();

      if (!deletedSlider) {
        return res.status(404).json({ error: 'Slider not found' });
      }

      res.json({ message: 'Slider deleted successfully' });
    } catch (error) {
      console.error('Error deleting slider:', error);
      res.status(500).json({ error: 'Failed to delete slider' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}