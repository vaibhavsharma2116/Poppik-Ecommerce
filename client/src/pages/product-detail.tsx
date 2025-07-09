import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ChevronRight, Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/types";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const productSlug = params?.slug || "";

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productSlug}`],
    enabled: !!productSlug,
  });

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${product?.category}`],
    enabled: !!product?.category,
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <span className="text-red-500 hover:text-red-600 font-medium">← Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelatedProducts = relatedProducts?.filter(p => p.id !== product.id).slice(0, 4) || [];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link href={`/category/${product.category}`} className="text-gray-500 hover:text-gray-700 capitalize">
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative">
            {product.saleOffer && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium z-10">
                {product.saleOffer}
              </Badge>
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product badges */}
            <div className="flex gap-2">
              {product.bestseller && (
                <Badge variant="secondary" className="text-xs">
                  #{product.category === 'skincare' ? '1' : product.category === 'haircare' ? '2' : '1'} in {product.category}
                </Badge>
              )}
              {product.newLaunch && (
                <Badge variant="secondary" className="text-xs">
                  NEW LAUNCH
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            <p className="text-lg text-gray-600">{product.shortDescription}</p>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {renderStars(parseFloat(product.rating))}
              </div>
              <span className="text-lg font-semibold">{product.rating}</span>
              <span className="text-gray-600">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            {/* Size */}
            {product.size && (
              <div>
                <span className="text-gray-700 font-medium">Size: </span>
                <span className="text-gray-600">{product.size}</span>
              </div>
            )}

            {/* Variants */}
            {(product.variants?.colors || product.variants?.shades) && (
              <div className="space-y-2">
                <label className="text-gray-700 font-medium">
                  {product.variants.colors ? 'Color:' : 'Shade:'}
                </label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${product.variants.colors ? 'color' : 'shade'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(product.variants.colors || product.variants.shades || []).map((variant) => (
                      <SelectItem key={variant} value={variant}>
                        {variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button size="lg" className="flex-1 btn-primary">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Stock status */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">In Stock</span>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <ul className="space-y-2">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Ingredient information not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                {product.benefits && product.benefits.length > 0 ? (
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Benefit information not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="how-to-use" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {product.howToUse || "Usage instructions not available for this product."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {filteredRelatedProducts.length > 0 && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You May Also Like</h2>
              <p className="text-gray-600">More products from {product.category}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
