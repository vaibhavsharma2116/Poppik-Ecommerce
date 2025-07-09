import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Category } from "@/lib/types";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug || "";
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${categorySlug}`],
    enabled: !!categorySlug,
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${categorySlug}`],
    enabled: !!categorySlug,
  });

  // Filter products based on selected subcategory
  const products = allProducts?.filter(product => {
    if (selectedSubcategory === "all") return true;
    return product.subcategory === selectedSubcategory;
  });

  // Get subcategories for current category
  const getSubcategoriesForCategory = (category: string) => {
    const subcategoryMap: Record<string, { value: string; label: string }[]> = {
      skincare: [
        { value: "serums", label: "Face Serums" },
        { value: "moisturizers", label: "Moisturizers" },
        { value: "cleansers", label: "Face Cleansers" },
        { value: "sunscreen", label: "Sunscreen" },
        { value: "toners", label: "Toners" },
        { value: "masks", label: "Face Masks" },
        { value: "eye-care", label: "Eye Care" },
        { value: "lip-care", label: "Lip Care" },
        { value: "acne-treatment", label: "Acne Treatment" },
        { value: "anti-aging", label: "Anti-Aging" },
        { value: "exfoliants", label: "Exfoliants" },
        { value: "mists", label: "Face Mists" }
      ],
      haircare: [
        { value: "shampoo", label: "Shampoos" },
        { value: "conditioner", label: "Conditioners" },
        { value: "oils", label: "Hair Oils" },
        { value: "masks", label: "Hair Masks" },
        { value: "scalp-care", label: "Scalp Care" },
        { value: "styling", label: "Styling Products" },
        { value: "growth-serum", label: "Hair Growth Serum" },
        { value: "leave-in", label: "Leave-in Treatments" },
        { value: "dry-shampoo", label: "Dry Shampoo" },
        { value: "hair-color", label: "Hair Color" },
        { value: "tools", label: "Hair Tools" },
        { value: "heat-protection", label: "Heat Protection" }
      ],
      makeup: [
        { value: "foundation", label: "Foundation" },
        { value: "concealer", label: "Concealer" },
        { value: "bb-cream", label: "BB Cream" },
        { value: "highlighter", label: "Highlighter" },
        { value: "blush", label: "Blush" },
        { value: "bronzer", label: "Bronzer" },
        { value: "mascara", label: "Mascara" },
        { value: "eyeshadow", label: "Eyeshadow" },
        { value: "eyeliner", label: "Eyeliner" },
        { value: "lipstick", label: "Lipstick" },
        { value: "lip-gloss", label: "Lip Gloss" },
        { value: "lip-liner", label: "Lip Liner" },
        { value: "makeup-tools", label: "Makeup Tools" },
        { value: "makeup-sets", label: "Makeup Sets" }
      ],
      bodycare: [
        { value: "body-wash", label: "Body Wash" },
        { value: "body-lotion", label: "Body Lotion" },
        { value: "body-oil", label: "Body Oil" },
        { value: "body-butter", label: "Body Butter" },
        { value: "body-scrub", label: "Body Scrub" },
        { value: "soap", label: "Natural Soaps" },
        { value: "hand-cream", label: "Hand Cream" },
        { value: "foot-cream", label: "Foot Care" },
        { value: "deodorant", label: "Deodorant" },
        { value: "intimate-care", label: "Intimate Care" },
        { value: "bath-salts", label: "Bath Salts" },
        { value: "body-mist", label: "Body Mist" }
      ],
      fragrances: [
        { value: "perfume", label: "Perfumes" },
        { value: "eau-de-toilette", label: "Eau de Toilette" },
        { value: "body-spray", label: "Body Spray" },
        { value: "roll-on", label: "Roll-on Fragrances" },
        { value: "solid-perfume", label: "Solid Perfume" },
        { value: "gift-sets", label: "Fragrance Gift Sets" },
        { value: "unisex", label: "Unisex Fragrances" },
        { value: "travel-size", label: "Travel Size" }
      ]
    };
    return subcategoryMap[category] || [];
  };

  if (categoryLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Link href="/">
            <span className="text-red-500 hover:text-red-600 font-medium">← Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select defaultValue="all" onValueChange={(value) => setSelectedSubcategory(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {getSubcategoriesForCategory(categorySlug).map((subcategory) => (
                <SelectItem key={subcategory.value} value={subcategory.value}>
                  {subcategory.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue="popular">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-skin">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Skin Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-skin">All Skin Types</SelectItem>
              <SelectItem value="oily">Oily Skin</SelectItem>
              <SelectItem value="dry">Dry Skin</SelectItem>
              <SelectItem value="sensitive">Sensitive Skin</SelectItem>
              <SelectItem value="combination">Combination Skin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Product count */}
            <div className="text-center mt-12">
              <p className="text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''} in {category.name}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your filters or check back later.</p>
            <Link href="/">
              <span className="text-red-500 hover:text-red-600 font-medium">← Continue Shopping</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
