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
    skincare: "from-pink-100 via-rose-50 to-pink-200",
    haircare: "from-blue-100 via-sky-50 to-blue-200", 
    makeup: "from-purple-100 via-violet-50 to-purple-200",
    bodycare: "from-green-100 via-emerald-50 to-green-200"
  };

  return (
    <div>
      {/* Hero Banner Section */}
      <HeroBanner />

      {/* Enhanced Categories Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-pink-500 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent"></div>
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-full mb-8 shadow-sm">
              <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                ✨ Premium Beauty Collection
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              <span className="text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
                Shop by Category
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Discover our complete range of beauty and wellness products crafted with premium ingredients 
              and designed for your unique beauty journey
            </p>
            <div className="mt-8 w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {categories?.map((category, index) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <div 
                    className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:rotate-1"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards'
                    }}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <div className={`relative h-full p-8 bg-gradient-to-br ${categoryGradients[category.slug as keyof typeof categoryGradients] || 'from-gray-100 to-gray-200'}`}>
                        {/* Decorative Elements */}
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full blur-sm"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>

                        <img
                          src={categoryImages[category.slug as keyof typeof categoryImages] || category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700 shadow-xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl group-hover:from-black/5 transition-all duration-500"></div>

                        {/* Floating Badge */}
                        {/* <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                          <span className="text-xs font-semibold text-gray-700">{category.productCount} items</span>
                        </div> */}
                      </div>
                    </div>
                    <div className="p-8 text-center relative">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors mb-4">
                        Explore {category.productCount} premium products
                      </p>
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-sm font-medium text-gray-700">Shop Now</span>
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Enhanced Products Section */}
          <div className="space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-full mb-6">
                <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                  🌟 Curated Collection
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
                  Our Products
                </span>
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light mb-8">
                Handpicked beauty essentials crafted with love and designed for your daily routine
              </p>
              {!allProductsLoading && allProducts && allProducts.length > 12 && (
                <Link href="/category/all">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3">
                    <span>Explore All {allProducts.length} Products</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
              )}
            </div>

            {/* Products Grid - 4 products per row */}
            {allProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-white shadow-sm">
                    <Skeleton className="h-72 w-full" />
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-6 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Optimized Grid Layout - 4 products per row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {allProducts?.slice(0, 8).map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      className="shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" 
                    />
                  ))}
                </div>

                {/* View More Button */}
                {!allProductsLoading && allProducts && allProducts.length > 10 && (
                  <div className="text-center mt-12">
                    <Link href="/products">
                      <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-black text-white hover:bg-gray-800 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                        View All Products ({allProducts.length})
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
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
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent"></div>
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-full mb-8 shadow-sm">
              <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                ⭐ Trending Now
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 bg-clip-text">
                Featured Products
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-8">
              Our newest and most innovative products, carefully selected for their exceptional quality
            </p>
            <Link href="/category/featured">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2">
                <span>View All Featured</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-72 w-full" />
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
              {/* Grid Layout for Featured Products - Max 4 per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {featuredProducts?.slice(0, 4).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    className="shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  />
                ))}
              </div>

              {/* View All Button */}
              {featuredProducts && featuredProducts.length > 4 && (
                <div className="text-center mt-10">
                  <Link href="/category/featured">
                    <Button className="btn-primary px-8 py-3 rounded-full">
                      View All Featured Products
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-yellow-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent"></div>
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-full mb-8 shadow-sm">
              <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text">
                🏆 Customer Favorites
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 bg-clip-text">
                Bestsellers
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-8">
              Our most loved products by customers - tried, tested, and trusted by thousands
            </p>
            <Link href="/category/bestsellers">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2">
                <span>View All Bestsellers</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>

          {bestsellersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-72 w-full" />
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
              {/* Grid Layout for Bestsellers - Max 4 per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {bestsellerProducts?.slice(0, 4).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    className="shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  />
                ))}
              </div>

              {/* View All Button */}
              {bestsellerProducts && bestsellerProducts.length > 4 && (
                <div className="text-center mt-10">
                  <Link href="/category/bestsellers">
                    <Button className="btn-primary px-8 py-3 rounded-full">
                      View All Bestsellers
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}