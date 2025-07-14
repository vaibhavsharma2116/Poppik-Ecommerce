
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Package, Tag } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { Product } from "@/lib/types";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [query, setQuery] = useState("");

  const { data: searchResults = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/search", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: query.trim().length > 0,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = () => {
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search for products..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.trim().length === 0 ? (
          <CommandEmpty>Start typing to search products...</CommandEmpty>
        ) : isLoading ? (
          <CommandEmpty>Searching...</CommandEmpty>
        ) : searchResults.length === 0 ? (
          <CommandEmpty>No products found.</CommandEmpty>
        ) : (
          <CommandGroup heading="Products">
            {searchResults.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`}>
                <CommandItem onSelect={handleSelect} className="cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Tag className="w-3 h-3" />
                        <span>{product.category?.name}</span>
                        <span>•</span>
                        <span>${product.price}</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              </Link>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
