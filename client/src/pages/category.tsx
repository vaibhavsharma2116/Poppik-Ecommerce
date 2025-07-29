import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/product-card";
import DynamicFilter from "@/components/dynamic-filter";
import type { Product, Category } from "@/lib/types";

export default function CategoryPage() {
  const params = useParams();
  const [location] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  // Get subcategory from URL path (e.g., /category/skincare/face-serums)
  const categorySlug = params.slug;
  const subcategorySlug = params.subcategorySlug;

  // Fetch all products
  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Fetch all categories for filter component
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch subcategories for current category
  const { data: subcategories = [] } = useQuery({
    queryKey: [`/api/categories/${params.slug}/subcategories`],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${params.slug}/subcategories`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Filter products based on category and subcategory
  const categoryFilteredProducts = useMemo(() => {
    if (!allProducts.length) return [];

    // First filter by category
    let filtered = allProducts.filter(product => 
      product.category?.toLowerCase() === categorySlug?.replace('-', ' ').toLowerCase()
    );

    // If subcategory is selected from URL path, further filter by subcategory
    if (subcategorySlug) {
      filtered = filtered.filter(product => 
        product.subcategory?.toLowerCase() === subcategorySlug.replace('-', ' ').toLowerCase()
      );
    }

    return filtered;
  }, [allProducts, categorySlug, subcategorySlug]);

  // Handle filter changes - now working with category/subcategory filtered products
  const handleFilterChange = (filtered: Product[], filters: any) => {
    setFilteredProducts(filtered);
    setActiveFilters(filters);
  };

  // Apply search and sort to filtered products
  const searchedProducts = filteredProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...searchedProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Initialize filtered products when category filtered products load
  useEffect(() => {
    if (categoryFilteredProducts.length > 0) {
      setFilteredProducts(categoryFilteredProducts);
    }
  }, [categoryFilteredProducts]);

  // Get current category and subcategory names for display
  const currentCategory = categories.find(cat => cat.slug === categorySlug);
  const currentSubcategory = subcategories.find(sub => sub.slug === subcategorySlug);

  return (
    <div className="container mx-auto py-12">
      <Link href="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/category/${categorySlug}`} className="hover:text-blue-600 transition-colors">
                {currentCategory?.name || categorySlug?.replace('-', ' ')}
              </Link>
              {subcategorySlug && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">
                    {currentSubcategory?.name || subcategorySlug.replace('-', ' ')}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {subcategorySlug 
                ? (currentSubcategory?.name || subcategorySlug.replace('-', ' '))
                : (currentCategory?.name || categorySlug?.replace('-', ' '))
              } Products
            </h1>
            <p className="text-gray-600 mt-1">
              {sortedProducts.length} of {categoryFilteredProducts.length} products found
              {subcategorySlug && (
                <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  in {currentSubcategory?.name || subcategorySlug.replace('-', ' ')}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="rating">Rating (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

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
                    Narrow down your search with these filters.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <DynamicFilter
                    products={categoryFilteredProducts}
                    categories={categories}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products match your current filters.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
    </div>
  );
}