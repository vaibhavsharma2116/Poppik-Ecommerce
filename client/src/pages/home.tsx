import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import HeroBanner from "@/components/hero-banner";
import ProductCard from "@/components/product-card";
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

  const handlePrimaryAction = () => {
    // Navigate to all products or open search
    window.scrollTo({ top: 1000, behavior: 'smooth' });
  };

  const handleSecondaryAction = () => {
    // Navigate to categories section
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

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
      {/* Hero Section */}
      <HeroBanner
        title="Discover Your"
        subtitle="Natural Glow"
        description="Premium beauty products crafted with natural ingredients for radiant skin and healthy hair."
        imageUrl="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        primaryAction={{
          text: "Shop All Products",
          onClick: handlePrimaryAction,
        }}
        secondaryAction={{
          text: "Explore Categories",
          onClick: handleSecondaryAction,
        }}
      />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our complete range of beauty and wellness products
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories?.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <div className="category-card">
                    <div className={`aspect-square overflow-hidden rounded-2xl p-6 hover:shadow-lg transition-shadow ${categoryGradients[category.slug as keyof typeof categoryGradients] || 'bg-gray-100'}`}>
                      <img
                        src={categoryImages[category.slug as keyof typeof categoryImages] || category.imageUrl}
                        alt={category.name}
                        className="category-image w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-center mt-4 group-hover:text-red-500 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600">Our newest and most innovative products</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bestsellers</h2>
            <p className="text-gray-600">Our most loved products by customers</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellerProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/category/skincare">
              <Button variant="outline" size="lg" className="btn-secondary">
                View All Products →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
