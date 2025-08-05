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

  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const subcategorySlug = urlParams.get('subcategory');

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: [`/api/categories/${params.slug}/subcategories`],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${params.slug}/subcategories`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const categoryFilteredProducts = useMemo(() => {
    if (!allProducts.length) return [];

    let filtered = allProducts.filter(product => 
      product.category?.toLowerCase() === params.slug?.replace('-', ' ').toLowerCase()
    );

    if (subcategorySlug) {
      filtered = filtered.filter(product => 
        product.subcategory?.toLowerCase() === subcategorySlug.replace('-', ' ').toLowerCase()
      );
    }

    return filtered;
  }, [allProducts, params.slug, subcategorySlug]);

  const handleFilterChange = (filtered: Product[], filters: any) => {
    setFilteredProducts(filtered);
    setActiveFilters(filters);
  };

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

  useEffect(() => {
    if (categoryFilteredProducts.length > 0) {
      setFilteredProducts(categoryFilteredProducts);
    }
  }, [categoryFilteredProducts]);

  const currentCategory = categories.find(cat => cat.slug === params.slug);
  const currentSubcategory = subcategories.find(sub => sub.slug === subcategorySlug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-4 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-4 sm:mb-6 bg-white/70 backdrop-blur-md rounded-xl px-3 py-2 shadow-md w-fit">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-sm sm:text-base">Back to Home</span>
        </Link>

        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent capitalize leading-tight">
              {currentCategory?.name || params.slug?.replace('-', ' ')} Products
              {currentSubcategory && (
                <span className="text-red-500 font-normal block sm:inline"> - {currentSubcategory.name}</span>
              )}
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {sortedProducts.length} of {categoryFilteredProducts.length} products
              {subcategorySlug && (
                <span className="ml-0 sm:ml-2 mt-2 sm:mt-0 inline-block text-xs sm:text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {currentSubcategory?.name || subcategorySlug.replace('-', ' ')}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-white/70 backdrop-blur-md border border-white/20 rounded-xl shadow-lg text-sm sm:text-base"
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-white/70 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl">
                <SelectItem value="name" className="rounded-lg">Name (A-Z)</SelectItem>
                <SelectItem value="price-low" className="rounded-lg">Price (Low to High)</SelectItem>
                <SelectItem value="price-high" className="rounded-lg">Price (High to Low)</SelectItem>
                <SelectItem value="rating" className="rounded-lg">Rating (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <div className="flex bg-white/70 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'hover:bg-gray-100'}`}
                >
                  <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'hover:bg-gray-100'}`}
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-md border border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80 sm:w-96 overflow-y-auto bg-white/90 backdrop-blur-md">
                  <SheetHeader>
                    <SheetTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Filter Products</SheetTitle>
                    <SheetDescription className="text-gray-600 font-medium">
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
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="max-w-md mx-auto bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/20">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full"></div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No products found</h3>
              <p className="text-gray-600 text-base sm:text-lg font-medium">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-lg border border-white/20">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {sortedProducts.length} Products Found
                </h2>
              </div>
            </div>

            <div className={
              `${viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8' 
                : 'space-y-4 sm:space-y-6'
              }`
            }>
              {sortedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
