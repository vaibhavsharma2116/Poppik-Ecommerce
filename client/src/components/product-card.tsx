import { Link } from "wouter";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
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
            <Button size="sm" className="btn-primary text-xs px-3 py-2">
              Select Shade
            </Button>
          ) : (
            <Button size="sm" className="btn-primary text-xs px-3 py-2">
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
