export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  originalPrice?: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  rating: string;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  newLaunch: boolean;
  saleOffer?: string;
  variants?: {
    colors?: string[];
    shades?: string[];
    sizes?: string[];
  };
  ingredients?: string[];
  benefits?: string[];
  howToUse?: string;
  size?: string;
  tags?: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: string;
  productCount: number;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  status: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}
