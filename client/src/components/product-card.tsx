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

export default function ProductCard({ product, className = "" }: ProductCardProps) {
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

  return (
    <Card className={`product-card ${className}`}>
      <div className="relative">
        {product.saleOffer && (
          <Badge className="sale-badge">
            {product.saleOffer}
          </Badge>
        )}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "text-red-500 fill-current" : "text-gray-400"}`} />
        </button>
        <Link href={`/product/${product.slug}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image w-full h-64 object-cover cursor-pointer"
          />
        </Link>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center mb-2">
          <div className="star-rating">
            {renderStars(parseFloat(product.rating))}
          </div>
          <span className="text-gray-600 text-sm ml-2">{product.rating}</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3">
          {product.shortDescription}
        </p>

        {product.size && (
          <p className="text-gray-500 text-xs mb-3">{product.size}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {product.variants?.colors || product.variants?.shades ? (
            <Link href={`/product/${product.slug}`}>
              <Button size="sm" className="btn-primary text-xs px-3 py-2">
                Select Shade
              </Button>
            </Link>
          ) : (
            <Button 
              size="sm" 
              className="btn-primary text-xs px-3 py-2 flex items-center gap-1"
              onClick={addToCart}
            >
              <ShoppingCart className="h-3 w-3" />
              Add to Cart
            </Button>
          )}
        </div>

        {/* Product badges */}
        <div className="flex gap-2 mt-3">
          {product.bestseller && (
            <Badge variant="secondary" className="text-xs">
              Bestseller
            </Badge>
          )}
          {product.newLaunch && (
            <Badge variant="secondary" className="text-xs">
              New Launch
            </Badge>
          )}
          {product.featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}