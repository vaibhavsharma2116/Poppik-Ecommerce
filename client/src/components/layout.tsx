import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Menu, X, User, Heart, LogOut, Sparkles } from "lucide-react";
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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 shadow-2xl backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg group-hover:blur-xl transition duration-300 opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-white to-gray-100 p-3 rounded-full shadow-lg">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent font-heading hover:scale-105 transition-transform duration-300">
                  Poppik
                </h1>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center space-x-4 relative flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                  <Input
                    type="text"
                    placeholder="Search for premium beauty products..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchInputFocus}
                    onBlur={handleSearchInputBlur}
                    className="w-full pl-12 pr-6 py-4 bg-transparent border-0 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 text-lg font-medium"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    {isSearchLoading ? (
                      <div className="p-6 text-center text-gray-600 font-medium">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 font-medium">No products found</div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all duration-300 border-b border-gray-100 last:border-0"
                            onClick={() => handleSearchResultClick(product.slug)}
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-xl shadow-md"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
                              <div className="text-sm text-gray-600">
                                {product.category?.name} • <span className="font-bold text-purple-600">${product.price}</span>
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
            <div className="flex items-center space-x-3">
              {/* Mobile Search */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchCommandOpen(true)}
                  className="relative bg-white/20 hover:bg-white/30 text-white rounded-xl p-3 transition-all duration-300"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </div>

              {/* Wishlist Icon */}
              <Link href="/wishlist">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative bg-gradient-to-r from-pink-500/20 to-red-500/20 hover:from-pink-500/30 hover:to-red-500/30 text-white rounded-xl p-3 transition-all duration-300 group border border-white/20"
                >
                  <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart Icon */}
              <Link href="/cart">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 text-white rounded-xl p-3 transition-all duration-300 group border border-white/20"
                >
                  <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Profile */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button 
                      variant="ghost" 
                      className="hidden md:flex bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-white/20"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Hi, {user.firstName}!
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                    className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-white rounded-xl p-3 transition-all duration-300 border border-white/20"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 border border-white/20"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Login
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden bg-white/20 hover:bg-white/30 text-white rounded-xl p-3 transition-all duration-300"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 text-white border-l border-white/20">
                  <div className="flex flex-col space-y-6 mt-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                        Navigation
                      </h2>
                    </div>

                    {staticNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-lg font-semibold transition-all duration-300 px-4 py-3 rounded-xl ${
                          isActiveLink(item.href)
                            ? "bg-white/20 text-yellow-200 shadow-lg"
                            : "text-white/90 hover:text-yellow-200 hover:bg-white/10"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}

                    <div className="border-t border-white/20 pt-4">
                      <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Categories</h3>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className={`block text-lg font-medium transition-all duration-300 px-4 py-2 rounded-xl ${
                            isActiveLink(`/category/${category.slug}`)
                              ? "bg-white/20 text-yellow-200"
                              : "text-white/90 hover:text-yellow-200 hover:bg-white/10"
                          }`}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4 pt-6 border-t border-white/20 mt-8">
                    {user ? (
                      <>
                        <Link href="/profile">
                          <Button variant="ghost" className="w-full justify-start bg-green-500/20 hover:bg-green-500/30 text-white rounded-xl">
                            <User className="h-5 w-5 mr-3" />
                            My Profile ({user.firstName})
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Link href="/auth/login">
                        <Button variant="ghost" className="w-full justify-start bg-yellow-500/20 hover:bg-yellow-500/30 text-white rounded-xl">
                          <User className="h-5 w-5 mr-3" />
                          Login / Signup
                        </Button>
                      </Link>
                    )}

                    <Link href="/wishlist">
                      <Button variant="ghost" className="w-full justify-start bg-pink-500/20 hover:bg-pink-500/30 text-white rounded-xl">
                        <Heart className="h-5 w-5 mr-3" />
                        Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                      </Button>
                    </Link>

                    <Link href="/cart">
                      <Button variant="ghost" className="w-full justify-start bg-indigo-500/20 hover:bg-indigo-500/30 text-white rounded-xl">
                        <ShoppingCart className="h-5 w-5 mr-3" />
                        Cart {cartCount > 0 && `(${cartCount})`}
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  onBlur={handleSearchInputBlur}
                  className="w-full pl-12 pr-6 py-4 bg-transparent border-0 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 font-medium"
                />
              </div>

              {/* Mobile Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="p-6 text-center text-gray-600 font-medium">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 font-medium">No products found</div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all duration-300"
                          onClick={() => handleSearchResultClick(product.slug)}
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-xl shadow-md"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.category?.name} • <span className="font-bold text-purple-600">${product.price}</span>
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
        <nav className="bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800 border-t border-white/10 hidden md:block shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
              <NavigationMenu>
                <NavigationMenuList className="space-x-1">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/"
                        className={`text-lg font-semibold transition-all duration-300 px-6 py-3 rounded-xl relative overflow-hidden group ${
                          isActiveLink("/")
                            ? "text-yellow-300 bg-gradient-to-r from-purple-600/40 to-pink-600/40 shadow-lg border border-yellow-300/30"
                            : "text-white bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 hover:text-yellow-300 border border-blue-500/30"
                        }`}
                      >
                        <span className="relative z-10">🏠 Home</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Dynamic Categories - Always Visible */}
                  {!loading && categories.map((category, index) => {
                    const categorySubcategories = getSubcategoriesForCategory(category.id);
                    const colorClasses = [
                      "from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border-purple-500/30",
                      "from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border-green-500/30",
                      "from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 border-orange-500/30",
                      "from-indigo-600/20 to-blue-600/20 hover:from-indigo-600/30 hover:to-blue-600/30 border-indigo-500/30",
                      "from-pink-600/20 to-rose-600/20 hover:from-pink-600/30 hover:to-rose-600/30 border-pink-500/30",
                      "from-teal-600/20 to-cyan-600/20 hover:from-teal-600/30 hover:to-cyan-600/30 border-teal-500/30"
                    ];
                    const colorClass = colorClasses[index % colorClasses.length];

                    const categoryEmojis = ["💄", "🧴", "✨", "🌟", "💅", "🎨"];
                    const emoji = categoryEmojis[index % categoryEmojis.length];

                    if (categorySubcategories.length > 0) {
                      return (
                        <NavigationMenuItem key={category.id}>
                          <NavigationMenuTrigger className={`text-lg font-semibold px-6 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group bg-gradient-to-r ${colorClass} ${
                            isActiveLink(`/category/${category.slug}`)
                              ? "text-yellow-300 shadow-lg"
                              : "text-white hover:text-yellow-300"
                          } border`}>
                            <span className="relative z-10">{category.name}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="grid gap-6 p-8 w-[600px] grid-cols-3 bg-gradient-to-br from-white via-purple-50 to-pink-50 border border-white/20 shadow-2xl rounded-2xl">
                              <div className="space-y-4">
                                <div className="border-b border-purple-200 pb-3">
                                  <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-wider">
                                    {category.name}
                                  </h4>
                                </div>
                                {categorySubcategories.slice(0, 4).map((subcategory) => (
                                  <NavigationMenuLink key={subcategory.id} asChild>
                                    <Link 
                                      href={`/category/${category.slug}?subcategory=${subcategory.slug}`}
                                      className="group block select-none rounded-2xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-100/80 hover:to-pink-100/80 hover:shadow-lg border border-transparent hover:border-purple-200/50 hover:scale-[1.02]"
                                      onClick={() => {
                                        setTimeout(() => {
                                          window.location.href = `/category/${category.slug}?subcategory=${subcategory.slug}`;
                                        }, 100);
                                      }}
                                    >
                                      <div className="text-base font-semibold text-gray-900 group-hover:text-purple-700 mb-2">
                                        {subcategory.name}
                                      </div>
                                      <p className="text-sm text-gray-600 group-hover:text-purple-600 leading-relaxed">
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
                                  <div className="border-b border-purple-200 pb-3">
                                    <h4 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider">More Options</h4>
                                  </div>
                                  {categorySubcategories.slice(4, 8).map((subcategory) => (
                                    <NavigationMenuLink key={subcategory.id} asChild>
                                      <Link 
                                        href={`/category/${category.slug}?subcategory=${subcategory.slug}`}
                                        className="group block select-none rounded-2xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-100/80 hover:to-purple-100/80 hover:shadow-lg border border-transparent hover:border-indigo-200/50 hover:scale-[1.02]"
                                        onClick={() => {
                                          setTimeout(() => {
                                            window.location.href = `/category/${category.slug}?subcategory=${subcategory.slug}`;
                                          }, 100);
                                        }}
                                      >
                                        <div className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 mb-2">
                                          {subcategory.name}
                                        </div>
                                        <p className="text-sm text-gray-600 group-hover:text-indigo-600 leading-relaxed">
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
                                <div className="border-b border-pink-200 pb-3">
                                  <h4 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent uppercase tracking-wider">Featured</h4>
                                </div>

                                <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-5 rounded-2xl border border-pink-200 shadow-lg">
                                  <NavigationMenuLink asChild>
                                    <Link href={`/category/${category.slug}`} className="block group">
                                      <div className="text-lg font-bold text-pink-700 mb-3 group-hover:text-pink-800">View All Products</div>
                                      <div className="text-sm text-gray-700 mb-4 leading-relaxed">
                                        Complete {category.name.toLowerCase()} collection with premium quality
                                      </div>
                                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
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
                      return (
                        <NavigationMenuItem key={category.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/category/${category.slug}`}
                              className={`text-lg font-semibold transition-all duration-300 px-6 py-3 rounded-xl relative overflow-hidden group bg-gradient-to-r ${colorClass} ${
                                isActiveLink(`/category/${category.slug}`)
                                  ? "text-yellow-300 shadow-lg"
                                  : "text-white hover:text-yellow-300"
                              } border`}
                            >
                              <span className="relative z-10">{category.name}</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
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
                        className={`text-lg font-semibold transition-all duration-300 px-6 py-3 rounded-xl relative overflow-hidden group bg-gradient-to-r from-amber-600/20 to-yellow-600/20 hover:from-amber-600/30 hover:to-yellow-600/30 border border-amber-500/30 ${
                          isActiveLink("/about")
                            ? "text-yellow-300 shadow-lg"
                            : "text-white hover:text-yellow-300"
                        }`}
                      >
                        <span className="relative z-10">ℹ️ About</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/contact"
                        className={`text-lg font-semibold transition-all duration-300 px-6 py-3 rounded-xl relative overflow-hidden group bg-gradient-to-r from-emerald-600/20 to-green-600/20 hover:from-emerald-600/30 hover:to-green-600/30 border border-emerald-500/30 ${
                          isActiveLink("/contact")
                            ? "text-yellow-300 shadow-lg"
                            : "text-white hover:text-yellow-300"
                        }`}
                      >
                        <span className="relative z-10">📞 Contact</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
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
      <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Poppik</h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your trusted partner for natural, effective beauty and wellness products with premium quality and modern design.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full text-white hover:scale-110 transition-transform">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full text-white hover:scale-110 transition-transform">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="bg-gradient-to-r from-red-500 to-pink-600 p-3 rounded-full text-white hover:scale-110 transition-transform">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#" className="bg-gradient-to-r from-blue-400 to-cyan-500 p-3 rounded-full text-white hover:scale-110 transition-transform">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6 text-xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold mb-6 text-xl bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Categories</h4>
              <ul className="space-y-3">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`} 
                      className="text-gray-400 hover:text-white transition-colors hover:underline"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                {categories.length > 6 && (
                  <li>
                    <Link 
                      href="/categories" 
                      className="text-purple-400 hover:text-purple-300 transition-colors font-semibold hover:underline"
                    >
                      View All Categories →
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-6 text-xl bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">Customer Support</h4>
              <ul className="space-y-3">
                {user && (
                  <li>
                    <Link href="/order-history" className="text-gray-400 hover:text-white transition-colors hover:underline">
                      Order History
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/track-order" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors hover:underline">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-lg">
              © 2025 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">Poppik</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}