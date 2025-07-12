
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { ChevronRight, Filter, X } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product, Category } from "@/lib/types";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug || "";
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [skinType, setSkinType] = useState("all-skin");
  const [priceRange, setPriceRange] = useState("all-price");
  const [showFilters, setShowFilters] = useState(false);

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${categorySlug}`],
    enabled: !!categorySlug,
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${categorySlug}`],
    enabled: !!categorySlug,
  });

  // Dynamic subcategories from actual products
  const availableSubcategories = useMemo(() => {
    if (!allProducts) return [];
    const subcategories = [...new Set(allProducts.map(p => p.subcategory).filter(Boolean))];
    return subcategories.map(sub => ({
      value: sub,
      label: sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }));
  }, [allProducts]);

  // Dynamic price ranges from actual products
  const priceRanges = useMemo(() => {
    if (!allProducts) return [];
    const prices = allProducts.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    return [
      { value: "all-price", label: "All Prices" },
      { value: "0-25", label: `₹${minPrice} - ₹${Math.floor(minPrice + range * 0.25)}` },
      { value: "25-50", label: `₹${Math.floor(minPrice + range * 0.25)} - ₹${Math.floor(minPrice + range * 0.5)}` },
      { value: "50-75", label: `₹${Math.floor(minPrice + range * 0.5)} - ₹${Math.floor(minPrice + range * 0.75)}` },
      { value: "75-100", label: `₹${Math.floor(minPrice + range * 0.75)} - ₹${maxPrice}` },
    ];
  }, [allProducts]);

  // Enhanced filtering and sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = [...allProducts];

    // Filter by subcategory
    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }

    // Filter by skin type (if applicable)
    if (skinType !== "all-skin") {
      filtered = filtered.filter(product => 
        product.skinType?.includes(skinType) || 
        product.description?.toLowerCase().includes(skinType)
      );
    }

    // Filter by price range
    if (priceRange !== "all-price") {
      const [min, max] = priceRange.split('-').map(Number);
      const minPrice = Math.min(...allProducts.map(p => p.price));
      const maxPrice = Math.max(...allProducts.map(p => p.price));
      const range = maxPrice - minPrice;
      
      const actualMin = minPrice + (range * min / 100);
      const actualMax = minPrice + (range * max / 100);
      
      filtered = filtered.filter(product => 
        product.price >= actualMin && product.price <= actualMax
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
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
  }, [allProducts, selectedSubcategory, sortBy, skinType, priceRange]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSubcategory !== "all") count++;
    if (skinType !== "all-skin") count++;
    if (priceRange !== "all-price") count++;
    return count;
  }, [selectedSubcategory, skinType, priceRange]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSubcategory("all");
    setSkinType("all-skin");
    setPriceRange("all-price");
  };

  if (categoryLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Link href="/">
            <span className="text-red-500 hover:text-red-600 font-medium">← Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
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
            {selectedSubcategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {availableSubcategories.find(s => s.value === selectedSubcategory)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedSubcategory("all")}
                />
              </Badge>
            )}
            {skinType !== "all-skin" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {skinType.charAt(0).toUpperCase() + skinType.slice(1)} Skin
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSkinType("all-skin")}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.value} value={subcategory.value}>
                    {subcategory.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={skinType} onValueChange={setSkinType}>
              <SelectTrigger>
                <SelectValue placeholder="Skin Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-skin">All Skin Types</SelectItem>
                <SelectItem value="oily">Oily Skin</SelectItem>
                <SelectItem value="dry">Dry Skin</SelectItem>
                <SelectItem value="sensitive">Sensitive Skin</SelectItem>
                <SelectItem value="combination">Combination Skin</SelectItem>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Product count */}
            <div className="text-center mt-12">
              <p className="text-gray-600">
                Showing {filteredAndSortedProducts.length} of {allProducts?.length || 0} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} in {category.name}
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
                : "Check back later for new products in this category."
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
