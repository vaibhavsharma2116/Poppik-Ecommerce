import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProductCard from "@/components/product-card";
import HeroBanner from "@/components/hero-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Category } from "@/lib/types";

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: bestsellerProducts, isLoading: bestsellersLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/bestsellers"],
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: allProducts, isLoading: allProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const categoryImages = {
    skincare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    haircare: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    makeup: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    bodycare: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  };

  const categoryGradients = {
    skincare: "gradient-pink",
    haircare: "gradient-blue", 
    makeup: "gradient-purple",
    bodycare: "gradient-green"
  };

  return (
    <div>
      {/* Hero Banner Section */}
      <HeroBanner />

      {/* Enhanced Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-black/5 rounded-full mb-6">
              <span className="text-sm font-medium text-gray-600">✨ Premium Beauty Collection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our complete range of beauty and wellness products crafted with premium ingredients
            </p>
          </div>

          {/* Dynamic Categories Grid */}
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-3xl" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {categories?.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <div className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="aspect-square overflow-hidden">
                      <div className={`relative h-full p-8 ${categoryGradients[category.slug as keyof typeof categoryGradients] || 'bg-gradient-to-br from-gray-100 to-gray-200'}`}>
                        <img
                          src={categoryImages[category.slug as keyof typeof categoryImages] || category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/10 rounded-2xl group-hover:bg-black/0 transition-colors duration-300"></div>
                      </div>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                        {category.productCount} products
                      </p>
                      <div className="mt-4 w-12 h-1 bg-gradient-to-r from-black to-gray-400 mx-auto opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Enhanced Products Section */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our Products</h3>
                <p className="text-gray-600">Handpicked beauty essentials for your daily routine</p>
              </div>
              {!allProductsLoading && allProducts && allProducts.length > 12 && (
                <Link href="/category/all">
                  <Button className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                    <span>View All ({allProducts.length})</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
              )}
            </div>

            {/* Scrollable Products Grid */}
            {allProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-white shadow-sm">
                    <Skeleton className="h-72 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-6 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Desktop: Scrollable horizontal layout */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto scrollbar-hide pb-6">
                    <div className="flex gap-6 w-max">
                      {allProducts?.slice(0, 15).map((product) => (
                        <div key={product.id} className="w-72 flex-shrink-0">
                          <ProductCard product={product} className="h-full shadow-sm hover:shadow-xl transition-shadow duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile & Tablet: Grid layout */}
                <div className="lg:hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {allProducts?.slice(0, 12).map((product) => (
                      <ProductCard key={product.id} product={product} className="shadow-sm hover:shadow-xl transition-shadow duration-300" />
                    ))}
                  </div>
                </div>

                {/* Mobile View More Button */}
                {!allProductsLoading && allProducts && allProducts.length > 12 && (
                  <div className="text-center mt-8 lg:hidden">
                    <Link href="/category/all">
                      <Button className="btn-primary w-full sm:w-auto">
                        View All Products ({allProducts.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600">Our newest and most innovative products</p>
            </div>
            <Link href="/category/featured">
              <Button variant="outline" className="hidden md:flex">
                View All Featured
              </Button>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : (
            <>
              <div className="overflow-hidden">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4" 
                     style={{scrollSnapType: 'x mandatory'}}>
                  {featuredProducts?.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-72" style={{scrollSnapAlign: 'start'}}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile View All Button */}
              <div className="text-center mt-8 md:hidden">
                <Link href="/category/featured">
                  <Button className="btn-primary">
                    View All Featured Products
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Bestsellers</h2>
              <p className="text-gray-600">Our most loved products by customers</p>
            </div>
            <Link href="/category/bestsellers">
              <Button variant="outline" className="hidden md:flex">
                View All Bestsellers
              </Button>
            </Link>
          </div>

          {bestsellersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : (
            <>
              <div className="overflow-hidden">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4" 
                     style={{scrollSnapType: 'x mandatory'}}>
                  {bestsellerProducts?.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-72" style={{scrollSnapAlign: 'start'}}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile View All Button */}
              <div className="text-center mt-8 md:hidden">
                <Link href="/category/bestsellers">
                  <Button className="btn-primary">
                    View All Bestsellers
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}