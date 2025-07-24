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
    <Card className={`product-card group ${className}`}>
      <div className="relative overflow-hidden">
        {product.saleOffer && (
          <Badge className="absolute top-1 left-1 z-10 bg-red-500 text-white px-1.5 py-0.5 text-xs animate-pulse">
            {product.saleOffer}
          </Badge>
        )}
        <button
          onClick={toggleWishlist}
          className="absolute top-1 right-1 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:scale-110 transition-all duration-200 z-10"
        >
          <Heart className={`h-3 w-3 transition-colors ${isInWishlist ? "text-red-500 fill-current" : "text-gray-400"}`} />
        </button>
        <Link href={`/product/${product.slug}`}>
          <div className="relative overflow-hidden bg-gray-50">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image w-full h-36 sm:h-48 md:h-64 lg:h-72 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
      </div>

      <CardContent className="mobile-product-content p-2 sm:p-3 md:p-4 lg:p-5 space-y-1 sm:space-y-2 md:space-y-3">
        <div className="flex items-center justify-between">
          <div className="star-rating">
            {renderStars(parseFloat(product.rating))}
          </div>
          <span className="text-gray-600 text-xs sm:text-sm font-medium">{product.rating}</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="mobile-product-title font-medium text-gray-900 hover:text-black transition-colors cursor-pointer line-clamp-2 min-h-[2rem] text-xs sm:text-sm md:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-baseline space-x-1 sm:space-x-2">
            <span className="mobile-product-price text-sm sm:text-base md:text-lg font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
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
              <Button size="sm" className="btn-primary w-full text-xs py-1.5 sm:py-2 hover:bg-gray-800 transition-colors">
                Select
              </Button>
            </Link>
          ) : (
            <Button 
              size="sm" 
              className="btn-primary w-full text-xs py-1.5 sm:py-2 flex items-center justify-center gap-1 hover:bg-gray-800 transition-colors"
              onClick={addToCart}
            >
              <ShoppingCart className="h-3 w-3" />
              <span className="hidden sm:inline">Add to</span> Cart
            </Button>
          )}
        </div>

        {/* Product badges */}
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
      </CardContent>
    </Card>
  );
}