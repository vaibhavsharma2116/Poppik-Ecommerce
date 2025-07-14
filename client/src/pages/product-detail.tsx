import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const productSlug = params?.slug || "";
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productSlug}`],
    enabled: !!productSlug,
  });

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${product?.category}`],
    enabled: !!product?.category,
  });

  useEffect(() => {
    if (product) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsInWishlist(wishlist.some((item: any) => item.id === product.id));
    }
  }, [product]);

  const toggleWishlist = () => {
    if (!product) return;

    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      window.location.href = "/auth/login";
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const existingIndex = wishlist.findIndex((item: any) => item.id === product.id);

    if (existingIndex >= 0) {
      wishlist.splice(existingIndex, 1);
      setIsInWishlist(false);
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist`,
      });
    } else {
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: `₹${product.price}`,
        originalPrice: product.originalPrice ? `₹${product.originalPrice}` : undefined,
        image: product.imageUrl,
        inStock: true,
        category: product.category,
        rating: product.rating,
      };
      wishlist.push(wishlistItem);
      setIsInWishlist(true);
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
      });
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = () => {
    if (!product) return;

    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      window.location.href = "/auth/login";
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((cartItem: any) => cartItem.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: `₹${product.price}`,
        originalPrice: product.originalPrice ? `₹${product.originalPrice}` : undefined,
        image: product.imageUrl,
        quantity: 1,
        inStock: true
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartCount", cart.reduce((total: number, item: any) => total + item.quantity, 0).toString());
    window.dispatchEvent(new Event("cartUpdated"));

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

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
              <Button size="lg" className="flex-1 btn-primary" onClick={addToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={toggleWishlist} >
                <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-600 text-red-600" : ""}`} />
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
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto bg-gray-50 rounded-xl p-1">
              <TabsTrigger 
                value="description" 
                className="py-3 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="ingredients" 
                className="py-3 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Ingredients
              </TabsTrigger>
              <TabsTrigger 
                value="benefits" 
                className="py-3 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Benefits
              </TabsTrigger>
              <TabsTrigger 
                value="how-to-use" 
                className="py-3 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                How to Use
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="description" className="m-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      </div>
                      Product Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ingredients" className="m-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      </div>
                      Key Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {product.ingredients ? (
                      <div className="grid gap-3">
                        {(Array.isArray(product.ingredients) 
                          ? product.ingredients 
                          : product.ingredients.split('\n').filter(ingredient => ingredient.trim())
                        ).map((ingredient, index) => (
                          <div key={index} className="flex items-start p-3 bg-white rounded-lg shadow-sm border border-red-100">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                            <span className="text-gray-700 font-medium">{ingredient.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-8 h-8 bg-red-200 rounded-full"></div>
                        </div>
                        <p className="text-gray-500 text-lg">Ingredient information not available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="benefits" className="m-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      </div>
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {product.benefits ? (
                      <div className="grid gap-3">
                        {(Array.isArray(product.benefits) 
                          ? product.benefits 
                          : product.benefits.split('\n').filter(benefit => benefit.trim())
                        ).map((benefit, index) => (
                          <div key={index} className="flex items-start p-3 bg-white rounded-lg shadow-sm border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                            <span className="text-gray-700 font-medium">{benefit.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                        </div>
                        <p className="text-gray-500 text-lg">Benefit information not available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="how-to-use" className="m-0">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      </div>
                      How to Use
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {product.howToUse ? (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed text-lg mb-0">
                            {product.howToUse}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
                        </div>
                        <p className="text-gray-500 text-lg">Usage instructions not available for this product.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

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