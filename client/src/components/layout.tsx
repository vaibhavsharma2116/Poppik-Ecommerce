import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Menu, X, User, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { Category, Subcategory } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchCommandOpen, setIsSearchCommandOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Load initial cart count
    const savedCartCount = localStorage.getItem("cartCount");
    if (savedCartCount) {
      setCartCount(parseInt(savedCartCount));
    }

    // Load initial wishlist count
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist);
        setWishlistCount(wishlist.length);
      } catch (error) {
        console.error("Error parsing wishlist data:", error);
      }
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCartCount = localStorage.getItem("cartCount");
      if (updatedCartCount) {
        setCartCount(parseInt(updatedCartCount));
      }
    };

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      const updatedWishlist = localStorage.getItem("wishlist");
      if (updatedWishlist) {
        try {
          const wishlist = JSON.parse(updatedWishlist);
          setWishlistCount(wishlist.length);
        } catch (error) {
          console.error("Error parsing wishlist data:", error);
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/subcategories')
        ]);

        if (categoriesRes.ok && subcategoriesRes.ok) {
          const [categoriesData, subcategoriesData] = await Promise.all([
            categoriesRes.json(),
            subcategoriesRes.json()
          ]);

          // Filter only active categories
          setCategories(categoriesData.filter((cat: Category) => cat.status === 'Active'));
          setSubcategories(subcategoriesData.filter((sub: Subcategory) => sub.status === 'Active'));
        }
      } catch (error) {
        console.error('Failed to fetch navigation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get subcategories for a specific category
  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  const staticNavItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchCommandOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white">


      {/* Main Header */}
      <header className=" bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <h1 className="text-2xl font-bold text-black cursor-pointer">
                Poppik
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Toggle - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist Icon */}
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                      Welcome, {user.firstName}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {staticNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-lg font-medium transition-colors ${
                          isActiveLink(item.href)
                            ? "text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className={`text-lg font-medium transition-colors ${
                          isActiveLink(`/category/${category.slug}`)
                            ? "text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-4 pt-4 border-t">
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setIsSearchOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        My Profile ({user.firstName})
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        handleLogout();
                        setIsSearchOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setIsSearchOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Login / Signup
                    </Button>
                  </Link>
                )}
                <Link href="/wishlist" onClick={() => setIsSearchOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Button>
                </Link>
                <Link href="/cart" onClick={() => setIsSearchOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Button>
                </Link>
              </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search Command */}
          {/* <SearchCommand
            open={isSearchCommandOpen}
            onOpenChange={setIsSearchCommandOpen}
          /> */}

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Desktop */}
        <nav className="bg-gray-50 border-t border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-12">
              <NavigationMenu>
                <NavigationMenuList className="space-x-4">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/"
                        className={`text-sm font-medium transition-colors px-4 py-2 ${
                          isActiveLink("/")
                            ? "text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      >
                        Home
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Dynamic Categories */}
                  {!loading && categories.map((category) => {
                    const categorySubcategories = getSubcategoriesForCategory(category.id);

                    if (categorySubcategories.length > 0) {
                      return (
                        <NavigationMenuItem key={category.id}>
                          <NavigationMenuTrigger className={`text-sm font-medium ${
                            isActiveLink(`/category/${category.slug}`)
                              ? "text-red-500"
                              : "text-gray-600 hover:text-red-500"
                          }`}>
                            {category.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="grid gap-4 p-8 w-[500px] grid-cols-3">
                              <div className="space-y-4">
                                <div className="border-b border-gray-200 pb-2">
                                  <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                                    {category.name}
                                  </h4>
                                </div>
                                {categorySubcategories.slice(0, 4).map((subcategory) => (
                                  <NavigationMenuLink key={subcategory.id} asChild>
                                    <Link 
                                      href={`/category/${category.slug}?subcategory=${subcategory.slug}`} 
                                      className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100"
                                    >
                                      <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">
                                        {subcategory.name}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                        {subcategory.description.length > 50 
                                          ? `${subcategory.description.substring(0, 50)}...` 
                                          : subcategory.description
                                        }
                                      </p>
                                    </Link>
                                  </NavigationMenuLink>
                                ))}
                              </div>

                              {categorySubcategories.length > 4 && (
                                <div className="space-y-4">
                                  <div className="border-b border-gray-200 pb-2">
                                    <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">More</h4>
                                  </div>
                                  {categorySubcategories.slice(4, 8).map((subcategory) => (
                                    <NavigationMenuLink key={subcategory.id} asChild>
                                      <Link 
                                        href={`/category/${category.slug}?subcategory=${subcategory.slug}`} 
                                        className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100"
                                      >
                                        <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">
                                          {subcategory.name}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                          {subcategory.description.length > 50 
                                            ? `${subcategory.description.substring(0, 50)}...` 
                                            : subcategory.description
                                          }
                                        </p>
                                      </Link>
                                    </NavigationMenuLink>
                                  ))}
                                </div>
                              )}

                              <div className="space-y-4">
                                <div className="border-b border-gray-200 pb-2">
                                  <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Featured</h4>
                                </div>

                                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                                  <NavigationMenuLink asChild>
                                    <Link href={`/category/${category.slug}`} className="block">
                                      <div className="text-sm font-semibold text-red-600 mb-2">View All</div>
                                      <div className="text-xs text-gray-600 mb-3">
                                        Complete {category.name.toLowerCase()} collection
                                      </div>
                                      <div className="text-xs bg-red-500 text-white px-2 py-1 rounded-full inline-block">
                                        Shop Now →
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                </div>
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    } else {
                      // Category without subcategories - simple link
                      return (
                        <NavigationMenuItem key={category.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/category/${category.slug}`}
                              className={`text-sm font-medium transition-colors px-4 py-2 ${
                                isActiveLink(`/category/${category.slug}`)
                                  ? "text-red-500"
                                  : "text-gray-600 hover:text-red-500"
                              }`}
                            >
                              {category.name}
                            </Link>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      );
                    }
                  })}

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/about"
                        className={`text-sm font-medium transition-colors px-4 py-2 ${
                          isActiveLink("/about")
                            ? "text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      >
                        About
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/contact"
                        className={`text-sm font-medium transition-colors px-4 py-2 ${
                          isActiveLink("/contact")
                            ? "text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      >
                        Contact
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">Poppik</h3>
              <p className="text-gray-400 mb-4">
                Your trusted partner for natural, effective beauty and wellness products.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                {/* <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li> */}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`} 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                {categories.length > 6 && (
                  <li>
                    <Link 
                      href="/categories" 
                      className="text-gray-400 hover:text-white transition-colors font-medium"
                    >
                      View All Categories →
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Customer Support</h4>
              <ul className="space-y-2">
                {user && (
                  <li>
                    <Link href="/order-history" className="text-gray-400 hover:text-white transition-colors">
                      Order History
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/track-order" className="text-gray-400 hover:text-white transition-colors">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Poppik. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}