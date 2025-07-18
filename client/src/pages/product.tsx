import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Filter, X } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState("all-price");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Dynamic categories from actual products
  const availableCategories = useMemo(() => {
    if (!allProducts) return [];
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    return categories.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }));
  }, [allProducts]);

  // Dynamic price ranges from actual products
  const priceRanges = useMemo(() => {
    if (!allProducts) return [];
    const prices = allProducts.map(p => typeof p.price === 'string' ? parseFloat(p.price) : p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return [
      { value: "all-price", label: "All Prices" },
      { value: "0-500", label: "₹0 - ₹500" },
      { value: "500-1000", label: "₹500 - ₹1000" },
      { value: "1000-2000", label: "₹1000 - ₹2000" },
      { value: "2000+", label: "₹2000+" },
    ];
  }, [allProducts]);

  // Enhanced filtering and sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== "all-price") {
      switch (priceRange) {
        case "0-500":
          filtered = filtered.filter(product => {
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            return price <= 500;
          });
          break;
        case "500-1000":
          filtered = filtered.filter(product => {
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            return price > 500 && price <= 1000;
          });
          break;
        case "1000-2000":
          filtered = filtered.filter(product => {
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            return price > 1000 && price <= 2000;
          });
          break;
        case "2000+":
          filtered = filtered.filter(product => {
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            return price > 2000;
          });
          break;
      }
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceB - priceA;
        });
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // popular
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return filtered;
  }, [allProducts, selectedCategory, sortBy, priceRange]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (priceRange !== "all-price") count++;
    return count;
  }, [selectedCategory, priceRange]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all-price");
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-medium">All Products</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of premium beauty and wellness products
          </p>
        </div>

        {/* Filters Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            )}
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {availableCategories.find(c => c.value === selectedCategory)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                />
              </Badge>
            )}
            {priceRange !== "all-price" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {priceRanges.find(p => p.value === priceRange)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setPriceRange("all-price")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedProducts && filteredAndSortedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className="shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                />
              ))}
            </div>

            {/* Product count */}
            <div className="text-center mt-12">
              <p className="text-gray-600">
                Showing {filteredAndSortedProducts.length} of {allProducts?.length || 0} product{filteredAndSortedProducts.length !== 1 ? 's' : ''}
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-sm">
                    ({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied)
                  </span>
                )}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-8">
              {activeFiltersCount > 0 
                ? "Try adjusting your filters to see more products."
                : "Check back later for new products."
              }
            </p>
            {activeFiltersCount > 0 ? (
              <Button onClick={clearAllFilters} variant="outline">
                Clear All Filters
              </Button>
            ) : (
              <Link href="/">
                <span className="text-red-500 hover:text-red-600 font-medium">← Continue Shopping</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}