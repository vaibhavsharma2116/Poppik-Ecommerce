import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, className = "", viewMode = 'grid' }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { toast } = useToast();

  // Check if product is in wishlist
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsInWishlist(wishlist.some((item: any) => item.id === product.id));
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      // Redirect to login page
      window.location.href = "/auth/login";
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const existingIndex = wishlist.findIndex((item: any) => item.id === product.id);

    if (existingIndex >= 0) {
      // Remove from wishlist
      wishlist.splice(existingIndex, 1);
      setIsInWishlist(false);
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist`,
        variant: "destructive",
      });
    } else {
      // Add to wishlist
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

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((cartItem: any) => cartItem.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      toast({
        title: "Cart Updated",
        description: `${product.name} quantity increased to ${existingItem.quantity}`,
      });
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
      toast({
        title: "Added to Cart",
        description: `${product.name} has been successfully added to your cart`,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartCount", cart.reduce((total: number, item: any) => total + item.quantity, 0).toString());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <Card className={`product-card group flex overflow-hidden ${className}`}>
        <div className="relative w-48 flex-shrink-0">
          {product.saleOffer && (
            <Badge className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 animate-pulse">
              {product.saleOffer}
            </Badge>
          )}
          <button
            onClick={toggleWishlist}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:scale-110 transition-all duration-200 z-10"
          >
            <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? "text-red-500 fill-current" : "text-gray-400"}`} />
          </button>
          <Link href={`/product/${product.slug}`}>
            <div className="relative overflow-hidden bg-gray-50 h-48">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        </div>

        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="star-rating">
                {renderStars(parseFloat(product.rating))}
              </div>
              <span className="text-gray-600 text-sm font-medium">{product.rating}</span>
            </div>

            <Link href={`/product/${product.slug}`}>
              <h3 className="font-semibold text-gray-900 hover:text-black transition-colors cursor-pointer text-lg">
                {product.name}
              </h3>
            </Link>

            <p className="text-gray-600 text-sm leading-relaxed">
              {product.shortDescription}
            </p>

            {product.size && (
              <p className="text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md inline-block">{product.size}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {product.bestseller && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  Bestseller
                </Badge>
              )}
              {product.newLaunch && (
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 hover:from-emerald-200 hover:to-teal-200 border border-emerald-200 font-semibold animate-pulse shadow-sm">
                  🚀 New Launch
                </Badge>
              )}
              {product.featured && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs text-green-600 font-medium">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              )}
            </div>

            {product.variants?.colors || product.variants?.shades ? (
              <Link href={`/product/${product.slug}`}>
                <Button size="sm" className="btn-primary w-full text-sm py-3 hover:bg-gray-800 transition-colors">
                  Select Shade
                </Button>
              </Link>
            ) : (
              <Button 
                size="sm" 
                className="btn-primary w-full text-sm py-3 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                onClick={addToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`product-card group relative overflow-hidden bg-gradient-to-br from-white via-rose-50/30 to-purple-50/40 backdrop-blur-sm border border-gradient-to-r from-pink-200/30 via-purple-200/30 to-blue-200/30 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.03] ${className}`}>
      {/* Enhanced Gradient overlay for premium look */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/60 via-purple-100/50 to-blue-100/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Colorful animated border */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none rounded-xl"></div>
      
      <div className="relative overflow-hidden rounded-t-xl">
        {product.saleOffer && (
          <Badge className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-4 py-2 text-xs font-bold shadow-xl animate-pulse rounded-full border-2 border-white/30 backdrop-blur-sm">
            ✨ {product.saleOffer}
          </Badge>
        )}
        
        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 z-20 p-3 bg-gradient-to-br from-white/95 to-pink-50/90 backdrop-blur-sm rounded-full shadow-xl hover:shadow-2xl hover:scale-125 transition-all duration-300 border-2 border-white/60 hover:border-pink-200/70"
        >
          <Heart className={`h-4 w-4 transition-all duration-300 ${isInWishlist ? "text-red-500 fill-current scale-125 drop-shadow-lg" : "text-gray-400 hover:text-pink-500"}`} />
        </button>

        <Link href={`/product/${product.slug}`}>
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image w-full h-full object-cover cursor-pointer group-hover:scale-115 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-pink-300/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Enhanced Rainbow shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/30 via-purple-400/30 via-blue-400/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out"></div>
            
            {/* Colorful corner accents */}
            <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-t-pink-400/20 border-r-[20px] border-r-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-b-blue-400/20 border-l-[20px] border-l-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </Link>
      </div>

      <CardContent className="relative p-6 space-y-4 bg-gradient-to-br from-white/95 to-rose-50/80 backdrop-blur-sm">
        {/* Enhanced Rating and review section */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg border border-amber-100/50">
          <div className="flex items-center space-x-1">
            {renderStars(parseFloat(product.rating))}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-amber-700 text-sm font-bold bg-amber-100 px-2 py-1 rounded-full">{product.rating}</span>
            <span className="text-amber-600 text-xs font-medium">({product.reviewCount || 0})</span>
          </div>
        </div>

        {/* Enhanced Product title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-gray-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 cursor-pointer line-clamp-2 min-h-[3rem] text-lg leading-tight group-hover:scale-105">
            {product.name}
          </h3>
        </Link>

        {/* Product description */}
        <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Enhanced Size info */}
        {product.size && (
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border border-purple-200/50 rounded-full shadow-sm">
            <span className="text-purple-700 text-xs font-semibold">📏 {product.size}</span>
          </div>
        )}

        {/* Enhanced Price section with vibrant styling */}
        <div className="space-y-4 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 p-4 rounded-xl border border-purple-100/30">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 line-through bg-gray-100 px-2 py-1 rounded-md">
                    ₹{product.originalPrice}
                  </span>
                </div>
              )}
            </div>
            {product.originalPrice && (
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 py-2 rounded-full shadow-lg animate-pulse">
                <span className="text-xs font-bold">
                  🎉 {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Action button */}
          {product.variants?.colors || product.variants?.shades ? (
            <Link href={`/product/${product.slug}`}>
              <Button className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 border-0 relative overflow-hidden">
                <span className="relative z-10">🎨 Select Shade</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-3 border-0 relative overflow-hidden"
              onClick={addToCart}
            >
              <ShoppingCart className="h-5 w-5 animate-bounce" />
              <span className="relative z-10">Add to Cart</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-green-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          )}
        </div>

        {/* Enhanced Product badges with vibrant designs */}
        <div className="flex flex-wrap gap-3 pt-2">
          {product.bestseller && (
            <Badge className="text-xs bg-gradient-to-r from-amber-400 to-yellow-400 text-white border-2 border-amber-300 hover:from-amber-500 hover:to-yellow-500 font-bold px-4 py-2 shadow-lg animate-pulse rounded-full">
              🏆 Bestseller
            </Badge>
          )}
          {product.newLaunch && (
            <Badge className="text-xs bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-2 border-emerald-300 hover:from-emerald-500 hover:to-teal-500 font-bold px-4 py-2 animate-bounce shadow-lg rounded-full">
              🚀 New Launch
            </Badge>
          )}
          {product.featured && (
            <Badge className="text-xs bg-gradient-to-r from-blue-400 to-indigo-400 text-white border-2 border-blue-300 hover:from-blue-500 hover:to-indigo-500 font-bold px-4 py-2 shadow-lg rounded-full">
              ⭐ Featured
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}