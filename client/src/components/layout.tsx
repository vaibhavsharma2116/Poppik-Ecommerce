import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Menu, X, User, Heart, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SearchCommand from "@/components/search-command";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { Category, Subcategory, Product } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import logo from "@assets/logo.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSearchCommandOpen, setIsSearchCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [location] = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Search functionality
  const { data: searchResults = [], isLoading: isSearchLoading } = useQuery<Product[]>({
    queryKey: ["/api/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleSearchResultClick = (productSlug: string) => {
    setSearchQuery("");
    setShowSearchResults(false);
    window.location.href = `/product/${productSlug}`;
  };

  const handleSearchInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowSearchResults(false), 200);
  };

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
      <header className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 border-b border-pink-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-300">
                <img 
  src={logo} 
  alt="POPPIK Logo" 
   style={{ width: 'auto', height: '120px' ,marginTop: '20px' }}

/>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center space-x-4 relative">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  onBlur={handleSearchInputBlur}
                  className="w-full pl-10 pr-4 bg-white/90 backdrop-blur-sm border-white/50 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-yellow-300 transition-all duration-300"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isSearchLoading ? (
                      <div className="p-4 text-center text-gray-500">Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No products found</div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSearchResultClick(product.slug)}
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.category?.name} • ${product.price}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search */}
              <div className="md:hidden flex items-center space-x-2 mt-4">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchCommandOpen(true)}
                    className="text-white hover:text-yellow-300 hover:bg-white/20 transition-all duration-300"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Wishlist Icon */}
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="relative text-white hover:text-yellow-300 hover:bg-white/20 transition-all duration-300">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-400 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative text-white hover:text-yellow-300 hover:bg-white/20 transition-all duration-300">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-400 to-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="hidden md:flex text-white hover:text-yellow-300 hover:bg-white/20 transition-all duration-300">
                      Welcome, {user.firstName}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    title="Logout"
                    className="text-white hover:text-red-300 hover:bg-white/20 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-yellow-300 hover:bg-white/20 transition-all duration-300">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden text-white hover:text-yellow-300 hover:bg-white/20 transition-all duration-300">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {staticNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`mobile-nav-item ${
                          isActiveLink(item.href)
                            ? "text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    {/* Categories with Submenus */}
                    <Accordion type="single" collapsible className="w-full mobile-accordion">
                      {categories.map((category) => {
                        const categorySubcategories = getSubcategoriesForCategory(category.id);
                        
                        if (categorySubcategories.length > 0) {
                          return (
                            <AccordionItem key={category.id} value={`category-${category.id}`}>
                              <AccordionTrigger className="responsive-nav-trigger">
                                <div className="flex items-center justify-between w-full">
                                  <span className={isActiveLink(`/category/${category.slug}`) ? "text-red-500" : "text-gray-700"}>
                                    {category.name}
                                  </span>
                                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 mobile-nav-chevron" />
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="responsive-submenu">
                                  <Link
                                    href={`/category/${category.slug}`}
                                    className="responsive-submenu-item font-medium text-red-600"
                                  >
                                    View All {category.name}
                                  </Link>
                                  {categorySubcategories.map((subcategory) => (
                                    <Link
                                      key={subcategory.id}
                                      href={`/category/${category.slug}?subcategory=${subcategory.slug}`}
                                      className="responsive-submenu-item"
                                      onClick={() => {
                                        setTimeout(() => {
                                          window.location.href = `/category/${category.slug}?subcategory=${subcategory.slug}`;
                                        }, 100);
                                      }}
                                    >
                                      {subcategory.name}
                                    </Link>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        } else {
                          // Category without subcategories - simple link
                          return (
                            <div key={category.id} className="mobile-menu-container border-b border-gray-100 last:border-b-0">
                              <Link
                                href={`/category/${category.slug}`}
                                className={`mobile-nav-item ${
                                  isActiveLink(`/category/${category.slug}`)
                                    ? "text-red-500"
                                    : "text-gray-600 hover:text-red-500"
                                }`}
                              >
                                {category.name}
                              </Link>
                            </div>
                          );
                        }
                      })}
                    </Accordion>
                  </div>
                  <div className="flex flex-col space-y-4 pt-4 border-t">
                {user ? (
                  <>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        My Profile ({user.firstName})
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Login / Signup
                    </Button>
                  </Link>
                )}
                <Link href="/wishlist">
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Button>
                </Link>
                <Link href="/cart">
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
          <SearchCommand
            open={isSearchCommandOpen}
            onOpenChange={setIsSearchCommandOpen}
          />

          {/* Mobile Search Bar */}
          <div className="md:hidden px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                onBlur={handleSearchInputBlur}
                className="w-full pl-10 pr-4 bg-white/90 backdrop-blur-sm border-white/50 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-yellow-300 transition-all duration-300"
              />

              {/* Mobile Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="p-4 text-center text-gray-500">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No products found</div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSearchResultClick(product.slug)}
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.category?.name} • ${product.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="bg-blac hidden md:block shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-12">
              <NavigationMenu>
                <NavigationMenuList className="space-x-4">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/"
                        className={`text-sm font-medium transition-colors px-4 py-2 transition-colors px-4 py-2 ${
                          isActiveLink("/")
                            ? "text-yellow-300 bg-white/20 rounded-full"
                            : "text-white text-yellow-300 bg-white/20 rounded-full"
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
                          <NavigationMenuTrigger className={`text-sm font-medium transition-colors px-4 py-2 ${
                            isActiveLink(`/category/${category.slug}`)
                              ? "text-yellow-300 bg-white/20 rounded-full"
                              : "text-black text-white-300 bg-white/20 rounded-full"
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
                                      onClick={() => {
                                        // Force page refresh to ensure proper filtering
                                        setTimeout(() => {
                                          window.location.href = `/category/${category.slug}?subcategory=${subcategory.slug}`;
                                        }, 100);
                                      }}
                                    >
                                      <div className="text-sm font-medium transition-colors px-4 py-2 text-gray-900 group-hover:text-red-600">
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
                                        onClick={() => {
                                          // Force page refresh to ensure proper filtering
                                          setTimeout(() => {
                                            window.location.href = `/category/${category.slug}?subcategory=${subcategory.slug}`;
                                          }, 100);
                                        }}
                                      >
                                        <div className="text-sm font-medium transition-colors px-4 py-2 text-gray-900 group-hover:text-red-600">
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
                              className={`text-sm font-medium transition-colors px-4 py-2 transition-colors px-4 py-2 ${
                                isActiveLink(`/category/${category.slug}`)
                                  ? "text-yellow-300 bg-white/20 rounded-full"
                                  : "text-white text-yellow-300 bg-white/20 rounded-full"
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
                        className={`text-sm font-medium transition-colors px-4 py-2 transition-colors px-4 py-2 ${
                          isActiveLink("/about")
                            ? "text-yellow-300 bg-white/20 rounded-full"
                            : "text-white text-yellow-300 bg-white/20 rounded-full"
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
                        className={`text-sm font-medium transition-colors px-4 py-2 transition-colors px-4 py-2 ${
                          isActiveLink("/contact")
                            ? "text-yellow-300 bg-white/20 rounded-full"
                            : "text-white text-yellow-300 bg-white/20 rounded-full"
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
              <div className="mb-4">
                <img 
                  src="/attached_assets/logo_1754036379278.png" 
                  alt="Poppik" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for natural, effective beauty and wellness products.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors duration-300 transform hover:scale-110"
                  title="Follow us on Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors duration-300 transform hover:scale-110"
                  title="Follow us on Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 transform hover:scale-110"
                  title="Subscribe to our YouTube channel"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110"
                  title="Connect with us on LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
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