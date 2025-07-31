import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ChevronRight, Star, ShoppingCart, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface Shade {
  id: number;
  name: string;
  colorCode: string;
  value: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const productSlug = params?.slug || "";
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAllShades, setShowAllShades] = useState(false);
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productSlug}`],
    enabled: !!productSlug,
  });

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${product?.category}`],
    enabled: !!product?.category,
  });

  // Mock category and subcategory data (replace with actual data fetching)
  const categories = [{ id: 1, name: 'skincare' }, { id: 2, name: 'haircare' }];
  const subcategories = [{ id: 3, name: 'face wash' }, { id: 4, name: 'shampoo' }];

  // Fetch shades based on product category
  const { data: shades = [] } = useQuery({
    queryKey: ['/api/shades', { categoryId: product?.category }],
    queryFn: async () => {
      const categoryObj = categories.find(cat => cat.name === product?.category);
      const subcategoryObj = subcategories.find(sub => sub.name === product?.subcategory);

      let url = '/api/shades';
      const params = new URLSearchParams();

      if (subcategoryObj) {
        params.append('subcategoryId', subcategoryObj.id.toString());
      } else if (categoryObj) {
        params.append('categoryId', categoryObj.id.toString());
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      return response.json();
    },
    enabled: !!product,
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredRelatedProducts = relatedProducts?.filter(p => p.id !== product.id).slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 sm:py-16">
      <div className="max-w-7xl mx-auto product-detail-container lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6 sm:mb-8 bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl breadcrumb-mobile sm:px-6 sm:py-4 shadow-lg border border-white/20">
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-purple-400" />
          <Link href={`/category/${product.category}`} className="text-purple-600 hover:text-purple-700 capitalize font-medium transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4 text-purple-400" />
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid product-detail-grid lg:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-16">
          {/* Product Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-xl sm:rounded-3xl blur-xl sm:blur-2xl group-hover:blur-2xl sm:group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative bg-white rounded-xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-white/20">
              {product.saleOffer && (
                <Badge className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg">
                  {product.saleOffer}
                </Badge>
              )}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-auto rounded-3xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-8">
            <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl border border-white/20">
              {/* Product badges */}
              <div className="flex gap-3 mb-6">
                {product.bestseller && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    #{product.category === 'skincare' ? '1' : product.category === 'haircare' ? '2' : '1'} in {product.category}
                  </Badge>
                )}
                {product.newLaunch && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    NEW LAUNCH
                  </Badge>
                )}
              </div>

              <h1 className="product-detail-title sm:text-4xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">{product.name}</h1>

              <p className="product-detail-description sm:text-lg text-gray-600 mb-4 sm:mb-6">{product.shortDescription}</p>

              {/* Rating */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="flex">
                  {renderStars(parseFloat(product.rating))}
                </div>
                <span className="product-detail-rating sm:text-xl font-bold text-gray-900">{product.rating}</span>
                <span className="text-sm sm:text-base text-gray-600 font-medium">({product.reviewCount.toLocaleString()} reviews)</span>
              </div>

              {/* Size */}
              {product.size && (
                <div className="mb-6">
                  <span className="text-gray-700 font-bold">Size: </span>
                  <span className="text-gray-900 font-semibold bg-gray-100 px-3 py-1 rounded-lg">{product.size}</span>
                </div>
              )}

              {/* Shades Selection - Always show for beauty products */}
              <div className="space-y-4 mb-6">
                <label className="text-gray-700 font-bold text-lg">
                  Select Shade:
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(() => {
                    const shadesToShow = showAllShades ? shades : shades.slice(0, 4);

                    return shadesToShow.map((shade) => (
                      <div key={shade.value} className="flex flex-col items-center group cursor-pointer">
                        <div 
                          className="w-12 h-12 rounded-full border-3 border-gray-300 hover:border-purple-400 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                          style={{ backgroundColor: shade.colorCode }}
                          title={shade.name}
                        ></div>
                        <span className="text-xs text-gray-600 mt-2 text-center leading-tight group-hover:text-purple-600 transition-colors">
                          {shade.name.split(' ')[0]}
                        </span>
                      </div>
                    ));
                  })()}
                </div>

                {/* View All Button */}
                {!showAllShades && shades.length > 4 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllShades(true)}
                      className="border-2 border-purple-200 hover:border-purple-400 rounded-xl px-6 py-2 font-semibold text-purple-600 hover:text-purple-700 transition-all duration-200"
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      View All Shades ({shades.length})
                    </Button>
                  </div>
                )}

                {/* Show Less Button */}
                {showAllShades && shades.length > 4 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllShades(false)}
                      className="border-2 border-purple-200 hover:border-purple-400 rounded-xl px-6 py-2 font-semibold text-purple-600 hover:text-purple-700 transition-all duration-200"
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </Button>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-3">
                  💡 Click on a shade to select it. Not sure about your shade? Our beauty experts can help you find the perfect match!
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                <span className="product-detail-price sm:text-4xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg sm:text-2xl text-gray-500 line-through">₹{product.originalPrice}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex product-detail-buttons sm:flex-row sm:space-x-4 sm:space-y-0 mb-4 sm:mb-6">
                <Button size="lg" className="product-detail-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200" onClick={addToCart}>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-purple-200 hover:border-purple-400 rounded-lg sm:rounded-xl p-3 sm:p-4 transform hover:scale-105 transition-all duration-200" onClick={toggleWishlist}>
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isInWishlist ? "fill-red-600 text-red-600" : "text-purple-500"}`} />
                </Button>
              </div>

              {/* Stock status */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-bold text-lg">In Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="product-detail-tabs sm:mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="product-detail-tab-list grid w-full grid-cols-2 lg:grid-cols-4 bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg border border-white/20">
              <TabsTrigger 
                value="description" 
                className="product-detail-tab-trigger sm:py-4 sm:px-6 sm:text-sm rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="ingredients" 
                className="product-detail-tab-trigger sm:py-4 sm:px-6 sm:text-sm rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Ingredients
              </TabsTrigger>
              <TabsTrigger 
                value="benefits" 
                className="product-detail-tab-trigger sm:py-4 sm:px-6 sm:text-sm rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Benefits
              </TabsTrigger>
              <TabsTrigger 
                value="how-to-use" 
                className="product-detail-tab-trigger sm:py-4 sm:px-6 sm:text-sm rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                How to Use
              </TabsTrigger>
            </TabsList>

            <div className="product-detail-tab-content sm:mt-8">
              <TabsContent value="description" className="m-0">
                <Card className="product-detail-card border-0 shadow-xl sm:shadow-2xl bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-md rounded-xl sm:rounded-3xl border border-white/20">
                  <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="product-detail-card-title sm:text-3xl text-gray-900 flex items-center">
                      <div className="product-detail-card-icon sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full"></div>
                      </div>
                      Product Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-lg font-medium">{product.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ingredients" className="m-0">
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-red-50/80 to-white/80 backdrop-blur-md rounded-3xl border border-white/20">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                      Key Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {product.ingredients ? (
                      <div className="grid gap-4">
                        {(Array.isArray(product.ingredients) 
                          ? product.ingredients 
                          : product.ingredients.split('\n').filter(ingredient => ingredient.trim())
                        ).map((ingredient, index) => (
                          <div key={index} className="flex items-start p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100/50 transform hover:scale-105 transition-all duration-200">
                            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                            <span className="text-gray-700 font-semibold text-lg">{ingredient.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-300 to-pink-300 rounded-2xl"></div>
                        </div>
                        <p className="text-gray-500 text-xl font-medium">Ingredient information not available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="benefits" className="m-0">
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50/80 to-white/80 backdrop-blur-md rounded-3xl border border-white/20">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {product.benefits ? (
                      <div className="grid gap-4">
                        {(Array.isArray(product.benefits) 
                          ? product.benefits 
                          : product.benefits.split('\n').filter(benefit => benefit.trim())
                        ).map((benefit, index) => (
                          <div key={index} className="flex items-start p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 transform hover:scale-105 transition-all duration-200">
                            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                            <span className="text-gray-700 font-semibold text-lg">{benefit.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-300 to-emerald-300 rounded-2xl"></div>
                        </div>
                        <p className="text-gray-500 text-xl font-medium">Benefit information not available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="how-to-use" className="m-0">
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50/80 to-white/80 backdrop-blur-md rounded-3xl border border-white/20">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                      How to Use
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {product.howToUse ? (
                      <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100/50">
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed text-lg font-medium mb-0">
                            {product.howToUse}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-2xl"></div>
                        </div>
                        <p className="text-gray-500 text-xl font-medium">Usage instructions not available for this product.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Customer Reviews Section */}
        <section className="bg-white/60 backdrop-blur-md rounded-xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl border border-white/20 mb-8 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-4">Customer Reviews</h2>
            <p className="text-gray-600 text-sm sm:text-lg font-medium">What our customers are saying</p>
          </div>

          {/* Reviews Summary */}
          <div className="bg-gradient-to-br from-yellow-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-yellow-200/50">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <div className="flex">
                    {renderStars(parseFloat(product.rating))}
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{product.rating}</span>
                </div>
                <p className="text-gray-600 font-medium">Based on {product.reviewCount.toLocaleString()} reviews</p>
              </div>
              <div className="space-y-2 w-full md:w-64">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-2">
                    <span className="text-sm font-medium w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                        style={{ 
                          width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : stars === 2 ? 2 : 1}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">
                      {stars === 5 ? '70%' : stars === 4 ? '20%' : stars === 3 ? '7%' : stars === 2 ? '2%' : '1%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {/* Review 1 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  P
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Priya Sharma</h4>
                      <p className="text-sm text-gray-500">Verified Purchase • 2 weeks ago</p>
                    </div>
                    <div className="flex">
                      {renderStars(5)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "Amazing product! I've been using this for a month now and can see visible improvements in my skin. The texture is perfect and it absorbs quickly without leaving any sticky residue. Highly recommended!"
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="hover:text-pink-600 transition-colors">👍 Helpful (23)</button>
                    <button className="hover:text-pink-600 transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Anita Desai</h4>
                      <p className="text-sm text-gray-500">Verified Purchase • 1 month ago</p>
                    </div>
                    <div className="flex">
                      {renderStars(5)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "Love this! Perfect for my sensitive skin. No irritation at all and the results are fantastic. The packaging is also very hygienic and travel-friendly."
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="hover:text-pink-600 transition-colors">👍 Helpful (18)</button>
                    <button className="hover:text-pink-600 transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Riya Patel</h4>
                      <p className="text-sm text-gray-500">Verified Purchase • 3 weeks ago</p>
                    </div>
                    <div className="flex">
                      {renderStars(4)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "Good product overall. Takes some time to show results but definitely worth it. The customer service is also excellent. Will definitely repurchase!"
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="hover:text-pink-600 transition-colors">👍 Helpful (12)</button>
                    <button className="hover:text-pink-600 transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Sneha Gupta</h4>
                      <p className="text-sm text-gray-500">Verified Purchase • 1 week ago</p>
                    </div>
                    <div className="flex">
                      {renderStars(5)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "Excellent quality! Fast delivery and great packaging. This has become part of my daily skincare routine. My skin feels so much softer and looks brighter."
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="hover:text-pink-600 transition-colors">👍 Helpful (31)</button>
                    <button className="hover:text-pink-600 transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Meera Singh</h4>
                      <p className="text-sm text-gray-500">Verified Purchase • 5 days ago</p>
                    </div>
                    <div className="flex">
                      {renderStars(4)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "Really impressed with the quality. Been using it for just a few days but already noticing improvements. The texture is lightweight and non-greasy. Perfect for oily skin like mine."
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="hover:text-pink-600 transition-colors">👍 Helpful (8)</button>
                    <button className="hover:text-pink-600 transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Load More Reviews Button */}
          <div className="text-center mt-8">
            <Button variant="outline" className="border-2 border-purple-200 hover:border-purple-400 rounded-xl px-8 py-3 font-semibold">
              Load More Reviews
            </Button>
          </div>
        </section>

        {/* Related Products */}
        {filteredRelatedProducts.length > 0 && (
          <section className="bg-white/60 backdrop-blur-md rounded-xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl border border-white/20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-4">You May Also Like</h2>
              <p className="text-gray-600 text-sm sm:text-lg font-medium">More products from {product.category}</p>
            </div>

            <div className="grid related-products-grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
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