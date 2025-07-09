import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Menu, X, ChevronRight } from "lucide-react";
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

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount] = useState(0);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Skincare", href: "/category/skincare" },
    { name: "Haircare", href: "/category/haircare" },
    { name: "Makeup", href: "/category/makeup" },
    { name: "Body Care", href: "/category/bodycare" },
    { name: "Fragrances", href: "/category/fragrances" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

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

              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
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

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

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

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`text-sm font-medium ${
                      isActiveLink("/category/skincare")
                        ? "text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}>
                      Skincare
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-6 p-8 w-[700px] grid-cols-4">
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Face Care</h4>
                          </div>
                          
                          {/* Face Serums with Sub-categories */}
                          <div className="group relative">
                            <NavigationMenuLink asChild>
                              <Link href="/category/skincare/serums" className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Face Serums</div>
                                    <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                      Advanced treatments
                                    </p>
                                  </div>
                                  <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-red-500" />
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            
                            {/* Sub-menu for Face Serums */}
                            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="p-4 space-y-2">
                                <Link href="/category/skincare/serums/vitamin-c" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Vitamin C Serums</div>
                                  <p className="text-xs text-gray-500">Brightening & antioxidant</p>
                                </Link>
                                <Link href="/category/skincare/serums/hyaluronic-acid" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Hyaluronic Acid</div>
                                  <p className="text-xs text-gray-500">Deep hydration</p>
                                </Link>
                                <Link href="/category/skincare/serums/niacinamide" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Niacinamide</div>
                                  <p className="text-xs text-gray-500">Pore refining</p>
                                </Link>
                                <Link href="/category/skincare/serums/retinol" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Retinol Serums</div>
                                  <p className="text-xs text-gray-500">Anti-aging</p>
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Moisturizers with Sub-categories */}
                          <div className="group relative">
                            <NavigationMenuLink asChild>
                              <Link href="/category/skincare/moisturizers" className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Moisturizers</div>
                                    <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                      Hydrating formulas
                                    </p>
                                  </div>
                                  <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-red-500" />
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            
                            {/* Sub-menu for Moisturizers */}
                            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="p-4 space-y-2">
                                <Link href="/category/skincare/moisturizers/day-cream" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Day Creams</div>
                                  <p className="text-xs text-gray-500">With SPF protection</p>
                                </Link>
                                <Link href="/category/skincare/moisturizers/night-cream" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Night Creams</div>
                                  <p className="text-xs text-gray-500">Intensive repair</p>
                                </Link>
                                <Link href="/category/skincare/moisturizers/gel-moisturizer" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Gel Moisturizers</div>
                                  <p className="text-xs text-gray-500">For oily skin</p>
                                </Link>
                              </div>
                            </div>
                          </div>

                          <NavigationMenuLink asChild>
                            <Link href="/category/skincare/cleansers" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Face Cleansers</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Gentle cleansing for all skin types
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>

                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Treatment</h4>
                          </div>
                          
                          {/* Sunscreen with Sub-categories */}
                          <div className="group relative">
                            <NavigationMenuLink asChild>
                              <Link href="/category/skincare/sunscreen" className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Sunscreen</div>
                                    <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                      UV protection
                                    </p>
                                  </div>
                                  <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-red-500" />
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            
                            {/* Sub-menu for Sunscreen */}
                            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="p-4 space-y-2">
                                <Link href="/category/skincare/sunscreen/spf-30" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">SPF 30</div>
                                  <p className="text-xs text-gray-500">Daily protection</p>
                                </Link>
                                <Link href="/category/skincare/sunscreen/spf-50" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">SPF 50+</div>
                                  <p className="text-xs text-gray-500">Maximum protection</p>
                                </Link>
                                <Link href="/category/skincare/sunscreen/tinted" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Tinted Sunscreen</div>
                                  <p className="text-xs text-gray-500">With coverage</p>
                                </Link>
                              </div>
                            </div>
                          </div>

                          <NavigationMenuLink asChild>
                            <Link href="/category/skincare/masks" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Face Masks</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Weekly intensive treatments
                              </p>
                            </Link>
                          </NavigationMenuLink>

                          <NavigationMenuLink asChild>
                            <Link href="/category/skincare/toners" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Toners</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Balancing & refreshing formulas
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>

                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">By Skin Type</h4>
                          </div>
                          
                          {/* Skin Type Categories */}
                          <div className="group relative">
                            <NavigationMenuLink asChild>
                              <Link href="/category/skincare/oily-skin" className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Oily Skin</div>
                                    <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                      Oil control products
                                    </p>
                                  </div>
                                  <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-red-500" />
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            
                            {/* Sub-menu for Oily Skin */}
                            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="p-4 space-y-2">
                                <Link href="/category/skincare/oily-skin/cleansers" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Oil Control Cleansers</div>
                                </Link>
                                <Link href="/category/skincare/oily-skin/toners" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Mattifying Toners</div>
                                </Link>
                                <Link href="/category/skincare/oily-skin/moisturizers" className="block p-2 rounded hover:bg-red-50 transition-colors">
                                  <div className="text-sm font-medium text-gray-900 hover:text-red-600">Lightweight Moisturizers</div>
                                </Link>
                              </div>
                            </div>
                          </div>

                          <NavigationMenuLink asChild>
                            <Link href="/category/skincare/dry-skin" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Dry Skin</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Hydrating solutions
                              </p>
                            </Link>
                          </NavigationMenuLink>

                          <NavigationMenuLink asChild>
                            <Link href="/category/skincare/sensitive-skin" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Sensitive Skin</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Gentle formulas
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>

                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Featured</h4>
                          </div>
                          
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                            <NavigationMenuLink asChild>
                              <Link href="/category/skincare/best-sellers" className="block">
                                <div className="text-sm font-semibold text-red-600 mb-2">Best Sellers</div>
                                <div className="text-xs text-gray-600 mb-3">Top-rated skincare essentials</div>
                                <div className="text-xs bg-red-500 text-white px-2 py-1 rounded-full inline-block">
                                  Shop Now →
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                          
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                            <NavigationMenuLink asChild>
                              <Link href="/category/skincare/new-arrivals" className="block">
                                <div className="text-sm font-semibold text-blue-600 mb-2">New Arrivals</div>
                                <div className="text-xs text-gray-600 mb-3">Latest skincare innovations</div>
                                <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full inline-block">
                                  Discover →
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </div>

                          <NavigationMenuLink asChild>
                            <Link href="/category/skincare" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">View All Skincare</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Complete collection & routines
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`text-sm font-medium ${
                      isActiveLink("/category/haircare")
                        ? "text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}>
                      Haircare
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-4 p-8 w-[500px] grid-cols-3">
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Treatment</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/haircare/growth-serum" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Hair Growth Serum</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Redensyl & Anagain formula
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/haircare/oils" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Hair Oils</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Nourishing treatments for all hair types
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/haircare/masks" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Hair Masks</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Deep conditioning treatments
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Cleansing</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/haircare/shampoo" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Shampoos</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Anti-dandruff & nourishing formulas
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/haircare/conditioner" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Conditioners</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Moisturizing & detangling
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/haircare/scalp-care" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Scalp Care</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Healthy scalp essentials
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Solutions</h4>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                            <NavigationMenuLink asChild>
                              <Link href="/category/haircare/hair-fall" className="block">
                                <div className="text-sm font-semibold text-red-600 mb-2">Hair Fall Solution</div>
                                <div className="text-xs text-gray-600 mb-3">Complete hair strengthening routine</div>
                                <div className="text-xs bg-red-500 text-white px-2 py-1 rounded-full inline-block">
                                  Shop Now →
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/haircare" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">View All Haircare</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Complete haircare collection
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`text-sm font-medium ${
                      isActiveLink("/category/makeup")
                        ? "text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}>
                      Makeup
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-4 p-8 w-[500px] grid-cols-3">
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Face</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/foundation" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Foundation</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Matte & dewy finish options
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/bb-cream" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">BB Cream</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Natural glow with SPF protection
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/concealer" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Concealer</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Full coverage & spot correction
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/highlighter" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Highlighter</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Glamorous sparkle & glow
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Eyes</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/mascara" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Mascara</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Mega curl tubing formula
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/eyeshadow" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Eyeshadow</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Blendable & long-lasting colors
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/eyeliner" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Eyeliner</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Precise & smudge-proof
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Lips</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/lipstick" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Lipstick</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Matte & glossy finishes
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/makeup/lip-gloss" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Lip Gloss</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                High shine & moisturizing
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                            <NavigationMenuLink asChild>
                              <Link href="/category/makeup" className="block">
                                <div className="text-sm font-semibold text-red-600 mb-2">Complete Look</div>
                                <div className="text-xs text-gray-600 mb-3">Curated makeup sets & bundles</div>
                                <div className="text-xs bg-red-500 text-white px-2 py-1 rounded-full inline-block">
                                  Explore →
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`text-sm font-medium ${
                      isActiveLink("/category/bodycare")
                        ? "text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}>
                      Body Care
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-4 p-8 w-[500px] grid-cols-3">
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Cleansing</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/body-wash" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Body Wash</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Gentle cleansing with natural ingredients
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/body-scrub" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Body Scrub</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Exfoliating for smooth skin
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/soap" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Natural Soaps</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Handcrafted & organic formulas
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Moisturizing</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/body-lotion" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Body Lotion</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Hydrating formulas for all skin types
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/body-oil" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Body Oil</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Nourishing oils for soft skin
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/body-butter" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Body Butter</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Rich & intensive moisturizing
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Special</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/hand-cream" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Hand Cream</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Intensive hand & nail care
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/bodycare/foot-cream" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Foot Care</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Soothing foot treatments
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                            <NavigationMenuLink asChild>
                              <Link href="/category/bodycare" className="block">
                                <div className="text-sm font-semibold text-red-600 mb-2">Complete Routine</div>
                                <div className="text-xs text-gray-600 mb-3">Head-to-toe body care sets</div>
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

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`text-sm font-medium ${
                      isActiveLink("/category/fragrances")
                        ? "text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}>
                      Fragrances
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-4 p-8 w-[500px] grid-cols-3">
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Women</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/perfume" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Perfumes</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Long-lasting luxury fragrances
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/eau-de-toilette" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Eau de Toilette</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Light & refreshing scents
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/body-spray" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Body Spray</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Fresh daily fragrance mist
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Travel & Mini</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/travel-size" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Travel Size</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Perfect for on-the-go
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/roll-on" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Roll-on</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Precise application & portability
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/solid-perfume" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Solid Perfume</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Concentrated & travel-friendly
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Collections</h4>
                          </div>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/unisex" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Unisex</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Scents for everyone
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/category/fragrances/gift-sets" className="group block select-none rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-red-600">Gift Sets</div>
                              <p className="text-xs text-gray-500 mt-1 group-hover:text-red-500">
                                Perfect fragrance bundles
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                            <NavigationMenuLink asChild>
                              <Link href="/category/fragrances" className="block">
                                <div className="text-sm font-semibold text-red-600 mb-2">New Arrivals</div>
                                <div className="text-xs text-gray-600 mb-3">Latest fragrance launches</div>
                                <div className="text-xs bg-red-500 text-white px-2 py-1 rounded-full inline-block">
                                  Discover →
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

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
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/category/skincare" className="text-gray-400 hover:text-white transition-colors">
                    Skincare
                  </Link>
                </li>
                <li>
                  <Link href="/category/haircare" className="text-gray-400 hover:text-white transition-colors">
                    Haircare
                  </Link>
                </li>
                <li>
                  <Link href="/category/makeup" className="text-gray-400 hover:text-white transition-colors">
                    Makeup
                  </Link>
                </li>
                <li>
                  <Link href="/category/bodycare" className="text-gray-400 hover:text-white transition-colors">
                    Body Care
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Fragrances
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Customer Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Returns & Exchanges
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="font-semibold mb-2">Subscribe to our Newsletter</h4>
                <p className="text-gray-400 text-sm">
                  Get the latest updates on new products and exclusive offers
                </p>
              </div>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-gray-800 border-gray-700 text-white rounded-r-none"
                />
                <Button className="bg-red-500 hover:bg-red-600 rounded-l-none">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Poppik. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
