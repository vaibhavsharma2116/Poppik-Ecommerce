
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Category, Subcategory } from "@/lib/types";

interface CategoryMenuProps {
  categories: Category[];
  subcategories: Subcategory[];
}

export default function CategoryMenu({ categories, subcategories }: CategoryMenuProps) {
  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  return (
    <div className="flex items-center space-x-4">
      {categories.map((category) => {
        const categorySubcategories = getSubcategoriesForCategory(category.id);
        
        if (categorySubcategories.length > 0) {
          return (
            <DropdownMenu key={category.id}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-yellow-300">
                  {category.name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuItem asChild>
                  <Link href={`/category/${category.slug}`} className="w-full">
                    View All {category.name}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categorySubcategories.map((subcategory) => (
                  <DropdownMenuItem key={subcategory.id} asChild>
                    <Link 
                      href={`/category/${category.slug}/${subcategory.slug}`}
                      className="w-full flex items-center justify-between hover:bg-gray-50 px-2 py-1"
                    >
                      <span>{subcategory.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="text-white hover:text-yellow-300 px-3 py-2 rounded-md transition-colors"
            >
              {category.name}
            </Link>
          );
        }
      })}
    </div>
  );
}
