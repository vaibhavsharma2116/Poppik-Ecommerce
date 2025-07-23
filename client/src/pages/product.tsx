import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Link } from "wouter";
import { ChevronRight, Grid3X3, List } from "lucide-react";
import ProductCard from "@/components/product-card";
import DynamicFilter from "@/components/dynamic-filter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import type { Product, Category } from "@/lib/types";

export default function ProductsPage() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({});

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Handle initial URL parameter filtering
  useEffect(() => {
    if (allProducts) {
      const filterParam = searchParams.get('filter');
      let filtered = [...allProducts];

      // Apply URL filter parameters
      if (filterParam) {
        switch (filterParam) {
          case 'bestseller':
            filtered = allProducts.filter(product => product.bestseller);
            break;
          case 'featured':
            filtered = allProducts.filter(product => product.featured);
            break;
          case 'newLaunch':
            filtered = allProducts.filter(product => product.newLaunch);
            break;
        }
      }
        
      let categoryParam = searchParams.get('category');
      if (categoryParam && categoryParam !== "all") {
        filtered = filtered.filter(product => product.category === categoryParam);
      }
      
      setFilteredProducts(filtered);
    }
  }, [allProducts, searchParams]);

  // Handle dynamic filter changes
  const handleFilterChange = (products: Product[], filters: any) => {
    setFilteredProducts(products);
    setActiveFilters(filters);
  };

  // Sort products based on selected sort option
  const sortedProducts = useMemo(() => {
    if (!filteredProducts) return [];

    let sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceA - priceB;
        });
        break;
      case "price-high":
        sorted.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceB - priceA;
        });
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // popular
        sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return sorted;
  }, [filteredProducts, sortBy]);

  return (
    <div className="py-16 bg-white">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-96 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Narrow down your search with advanced filters.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    {allProducts && categories && (
                      <DynamicFilter
                        products={allProducts}
                        categories={categories}
                        onFilterChange={handleFilterChange}
                      />
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block lg:col-span-1">
            {allProducts && categories && !productsLoading && !categoriesLoading && (
              <div className="sticky top-4">
                <DynamicFilter
                  products={allProducts}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}
          </div>

          {/* Products Display */}
          <div className="lg:col-span-3">
            {productsLoading || categoriesLoading ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {Array.from({ length: 12 }).map((_, i) => (
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
            ) : sortedProducts && sortedProducts.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {sortedProducts.map((product) => (
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
                    Showing {sortedProducts.length} of {allProducts?.length || 0} product{sortedProducts.length !== 1 ? 's' : ''}
                    {Object.keys(activeFilters).length > 0 && (
                      <span className="ml-2 text-sm">
                        (with filters applied)
                      </span>
                    )}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-8">
                  {Object.keys(activeFilters).length > 0 
                    ? "Try adjusting your filters to see more products."
                    : "Check back later for new products."
                  }
                </p>
                <Link href="/">
                  <span className="text-red-500 hover:text-red-600 font-medium">← Continue Shopping</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}