
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  Grid3X3, 
  List,
  Star,
  Eye,
  MoreVertical,
  Package,
  TrendingUp,
  AlertTriangle,
  Image as ImageIcon,
  Layers,
  Tag,
  FolderOpen,
  ChevronRight,
  Settings
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'Active' | 'Inactive';
  productCount: number;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  status: 'Active' | 'Inactive';
  productCount: number;
}

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: 'Skincare',
      slug: 'skincare',
      description: 'Premium skincare products for all skin types',
      image: '/api/placeholder/300/200',
      status: 'Active',
      productCount: 45,
      subcategories: [
        { id: 1, name: 'Face Serums', slug: 'serums', description: 'Anti-aging and hydrating serums', categoryId: 1, status: 'Active', productCount: 12 },
        { id: 2, name: 'Moisturizers', slug: 'moisturizers', description: 'Daily moisturizing products', categoryId: 1, status: 'Active', productCount: 18 },
        { id: 3, name: 'Cleansers', slug: 'cleansers', description: 'Face cleansing products', categoryId: 1, status: 'Active', productCount: 15 }
      ]
    },
    {
      id: 2,
      name: 'Makeup',
      slug: 'makeup',
      description: 'High-quality makeup products and cosmetics',
      image: '/api/placeholder/300/200',
      status: 'Active',
      productCount: 32,
      subcategories: [
        { id: 4, name: 'Foundations', slug: 'foundations', description: 'Full coverage foundations', categoryId: 2, status: 'Active', productCount: 8 },
        { id: 5, name: 'Lipsticks', slug: 'lipsticks', description: 'Long-lasting lipsticks', categoryId: 2, status: 'Active', productCount: 14 },
        { id: 6, name: 'Eyeshadows', slug: 'eyeshadows', description: 'Vibrant eyeshadow palettes', categoryId: 2, status: 'Active', productCount: 10 }
      ]
    },
    {
      id: 3,
      name: 'Hair Care',
      slug: 'haircare',
      description: 'Professional hair care and styling products',
      image: '/api/placeholder/300/200',
      status: 'Active',
      productCount: 28,
      subcategories: [
        { id: 7, name: 'Shampoos', slug: 'shampoos', description: 'Nourishing shampoos', categoryId: 3, status: 'Active', productCount: 10 },
        { id: 8, name: 'Conditioners', slug: 'conditioners', description: 'Hair conditioning treatments', categoryId: 3, status: 'Active', productCount: 8 },
        { id: 9, name: 'Hair Oils', slug: 'hair-oils', description: 'Natural hair oils', categoryId: 3, status: 'Active', productCount: 10 }
      ]
    },
    {
      id: 4,
      name: 'Body Care',
      slug: 'bodycare',
      description: 'Luxurious body care and wellness products',
      image: '/api/placeholder/300/200',
      status: 'Inactive',
      productCount: 0,
      subcategories: []
    }
  ]);

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'Active' as const
  });

  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    status: 'Active' as const
  });

  // Get all subcategories
  const allSubcategories = categories.flatMap(cat => cat.subcategories);

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter subcategories
  const filteredSubcategories = allSubcategories.filter(subcategory => {
    const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subcategory.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subcategory.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now(),
      name: categoryFormData.name,
      slug: categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
      description: categoryFormData.description,
      image: '/api/placeholder/300/200',
      status: categoryFormData.status,
      productCount: 0,
      subcategories: []
    };
    setCategories(prev => [...prev, newCategory]);
    setIsAddCategoryModalOpen(false);
    setCategoryFormData({ name: '', slug: '', description: '', status: 'Active' });
  };

  const handleAddSubcategory = () => {
    const newSubcategory: Subcategory = {
      id: Date.now(),
      name: subcategoryFormData.name,
      slug: subcategoryFormData.slug || subcategoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
      description: subcategoryFormData.description,
      categoryId: parseInt(subcategoryFormData.categoryId),
      status: subcategoryFormData.status,
      productCount: 0
    };
    
    setCategories(prev => prev.map(cat => 
      cat.id === parseInt(subcategoryFormData.categoryId) 
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
        : cat
    ));
    setIsAddSubcategoryModalOpen(false);
    setSubcategoryFormData({ name: '', slug: '', description: '', categoryId: '', status: 'Active' });
  };

  const handleDeleteCategory = (categoryId: number) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSubcategory = (subcategoryId: number) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId)
    })));
    setIsDeleteModalOpen(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description,
      categoryId: subcategory.categoryId.toString(),
      status: subcategory.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    
    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id 
        ? { 
            ...cat, 
            name: categoryFormData.name,
            slug: categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
            description: categoryFormData.description,
            status: categoryFormData.status
          }
        : cat
    ));
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', slug: '', description: '', status: 'Active' });
  };

  const handleUpdateSubcategory = () => {
    if (!editingSubcategory) return;
    
    setCategories(prev => prev.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.map(sub => 
        sub.id === editingSubcategory.id 
          ? {
              ...sub,
              name: subcategoryFormData.name,
              slug: subcategoryFormData.slug || subcategoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
              description: subcategoryFormData.description,
              categoryId: parseInt(subcategoryFormData.categoryId),
              status: subcategoryFormData.status
            }
          : sub
      )
    })));
    setIsEditModalOpen(false);
    setEditingSubcategory(null);
    setSubcategoryFormData({ name: '', slug: '', description: '', categoryId: '', status: 'Active' });
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleViewSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsViewModalOpen(true);
  };

  const stats = [
    { label: "Total Categories", value: categories.length.toString(), icon: Layers, color: "from-blue-500 to-cyan-500" },
    { label: "Total Subcategories", value: allSubcategories.length.toString(), icon: Tag, color: "from-purple-500 to-pink-500" },
    { label: "Active Categories", value: categories.filter(c => c.status === 'Active').length.toString(), icon: Package, color: "from-green-500 to-emerald-500" },
    { label: "Total Products", value: categories.reduce((sum, cat) => sum + cat.productCount, 0).toString(), icon: TrendingUp, color: "from-orange-500 to-red-500" }
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Category Management
          </h2>
          <p className="text-slate-600 mt-1">Organize your product categories and subcategories</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
          <Button onClick={() => setIsAddSubcategoryModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Controls */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Categories ({filteredCategories.length})
          </TabsTrigger>
          <TabsTrigger value="subcategories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Subcategories ({filteredSubcategories.length})
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {filteredCategories.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No categories found</h3>
                <p className="text-slate-600">Create your first category to get started</p>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative">
                    <div className="aspect-video bg-slate-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                      <ImageIcon className="h-12 w-12 text-slate-400" />
                    </div>
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        category.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {category.status}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{category.name}</h3>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{category.description}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <span>{category.productCount} products</span>
                      <span>{category.subcategories.length} subcategories</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-9 transition-all hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleViewCategory(category)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-9 transition-all hover:bg-emerald-50 hover:text-emerald-600"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 w-9 p-0 transition-all hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage your product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Subcategories</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-slate-500">{category.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-slate-600 truncate">{category.description}</p>
                        </TableCell>
                        <TableCell>{category.productCount}</TableCell>
                        <TableCell>{category.subcategories.length}</TableCell>
                        <TableCell>
                          <Badge variant={category.status === 'Active' ? 'default' : 'destructive'}>
                            {category.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewCategory(category)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Subcategories Tab */}
        <TabsContent value="subcategories" className="space-y-6">
          {filteredSubcategories.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No subcategories found</h3>
                <p className="text-slate-600">Create subcategories to organize your products better</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Subcategories</CardTitle>
                <CardDescription>Manage your product subcategories</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subcategory</TableHead>
                      <TableHead>Parent Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubcategories.map((subcategory) => {
                      const parentCategory = categories.find(cat => cat.id === subcategory.categoryId);
                      return (
                        <TableRow key={subcategory.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Tag className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <div className="font-medium">{subcategory.name}</div>
                                <div className="text-sm text-slate-500">{subcategory.slug}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <FolderOpen className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{parentCategory?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-slate-600 truncate">{subcategory.description}</p>
                          </TableCell>
                          <TableCell>{subcategory.productCount}</TableCell>
                          <TableCell>
                            <Badge variant={subcategory.status === 'Active' ? 'default' : 'destructive'}>
                              {subcategory.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewSubcategory(subcategory)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditSubcategory(subcategory)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedSubcategory(subcategory);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Category Modal */}
      <Dialog open={isAddCategoryModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddCategoryModalOpen(false);
          setIsEditModalOpen(false);
          setEditingCategory(null);
          setEditingSubcategory(null);
          setCategoryFormData({ name: '', slug: '', description: '', status: 'Active' });
          setSubcategoryFormData({ name: '', slug: '', description: '', categoryId: '', status: 'Active' });
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingCategory ? <Edit className="h-5 w-5 text-emerald-600" /> : editingSubcategory ? <Edit className="h-5 w-5 text-purple-600" /> : <Layers className="h-5 w-5 text-blue-600" />}
              {editingCategory ? 'Edit Category' : editingSubcategory ? 'Edit Subcategory' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category details' : editingSubcategory ? 'Update the subcategory details' : 'Create a new product category for your store'}
            </DialogDescription>
          </DialogHeader>
          {!editingSubcategory && (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="category-name">{editingCategory ? 'Category' : 'Category'} Name</Label>
                <Input
                  id="category-name"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Skincare"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category-slug">URL Slug</Label>
                <Input
                  id="category-slug"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., skincare (auto-generated if empty)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the category"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category-status">Status</Label>
                <Select value={categoryFormData.status} onValueChange={(value) => setCategoryFormData(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {editingSubcategory && (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="subcategory-category">Parent Category</Label>
                <Select value={subcategoryFormData.categoryId} onValueChange={(value) => setSubcategoryFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.status === 'Active').map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory-name">Subcategory Name</Label>
                <Input
                  id="subcategory-name"
                  value={subcategoryFormData.name}
                  onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Face Serums"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subcategory-slug">URL Slug</Label>
                <Input
                  id="subcategory-slug"
                  value={subcategoryFormData.slug}
                  onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., face-serums (auto-generated if empty)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subcategory-description">Description</Label>
                <Textarea
                  id="subcategory-description"
                  value={subcategoryFormData.description}
                  onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the subcategory"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subcategory-status">Status</Label>
                <Select value={subcategoryFormData.status} onValueChange={(value) => setSubcategoryFormData(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddCategoryModalOpen(false);
              setIsEditModalOpen(false);
              setEditingCategory(null);
              setEditingSubcategory(null);
              setCategoryFormData({ name: '', slug: '', description: '', status: 'Active' });
              setSubcategoryFormData({ name: '', slug: '', description: '', categoryId: '', status: 'Active' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingCategory) {
                  handleUpdateCategory();
                } else if (editingSubcategory) {
                  handleUpdateSubcategory();
                } else {
                  handleAddCategory();
                }
              }} 
              className={editingCategory ? "bg-emerald-600 hover:bg-emerald-700" : editingSubcategory ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              {editingCategory ? 'Update Category' : editingSubcategory ? 'Update Subcategory' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Modal */}
      <Dialog open={isAddSubcategoryModalOpen} onOpenChange={setIsAddSubcategoryModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-600" />
              Add New Subcategory
            </DialogTitle>
            <DialogDescription>
              Create a new subcategory under an existing category
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="subcategory-category">Parent Category</Label>
              <Select value={subcategoryFormData.categoryId} onValueChange={(value) => setSubcategoryFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat.status === 'Active').map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategory-name">Subcategory Name</Label>
              <Input
                id="subcategory-name"
                value={subcategoryFormData.name}
                onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Face Serums"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subcategory-slug">URL Slug</Label>
              <Input
                id="subcategory-slug"
                value={subcategoryFormData.slug}
                onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., face-serums (auto-generated if empty)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subcategory-description">Description</Label>
              <Textarea
                id="subcategory-description"
                value={subcategoryFormData.description}
                onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the subcategory"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subcategory-status">Status</Label>
              <Select value={subcategoryFormData.status} onValueChange={(value) => setSubcategoryFormData(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubcategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubcategory} className="bg-purple-600 hover:bg-purple-700">
              Add Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              {selectedCategory ? 'Category Details' : 'Subcategory Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Layers className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedCategory.name}</h3>
                  <p className="text-slate-600">{selectedCategory.slug}</p>
                  <Badge variant={selectedCategory.status === 'Active' ? 'default' : 'destructive'}>
                    {selectedCategory.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Description</Label>
                <p className="mt-1 text-slate-900">{selectedCategory.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Products</Label>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{selectedCategory.productCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Subcategories</Label>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{selectedCategory.subcategories.length}</p>
                </div>
              </div>
              {selectedCategory.subcategories.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Subcategories</Label>
                  <div className="mt-2 space-y-2">
                    {selectedCategory.subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="font-medium">{sub.name}</span>
                        <Badge variant={sub.status === 'Active' ? 'default' : 'destructive'}>
                          {sub.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {selectedSubcategory && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Tag className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedSubcategory.name}</h3>
                  <p className="text-slate-600">{selectedSubcategory.slug}</p>
                  <Badge variant={selectedSubcategory.status === 'Active' ? 'default' : 'destructive'}>
                    {selectedSubcategory.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Parent Category</Label>
                <p className="mt-1 text-slate-900">{categories.find(cat => cat.id === selectedSubcategory.categoryId)?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Description</Label>
                <p className="mt-1 text-slate-900">{selectedSubcategory.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Products</Label>
                <p className="mt-1 text-2xl font-bold text-slate-900">{selectedSubcategory.productCount}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete {selectedCategory ? 'Category' : 'Subcategory'}
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this {selectedCategory ? 'category' : 'subcategory'}?
            </DialogDescription>
          </DialogHeader>
          {(selectedCategory || selectedSubcategory) && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                {selectedCategory ? <Layers className="h-6 w-6 text-slate-400" /> : <Tag className="h-6 w-6 text-slate-400" />}
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedCategory?.name || selectedSubcategory?.name}</p>
                <p className="text-sm text-slate-600">{selectedCategory?.description || selectedSubcategory?.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedCategory) {
                  handleDeleteCategory(selectedCategory.id);
                  setSelectedCategory(null);
                } else if (selectedSubcategory) {
                  handleDeleteSubcategory(selectedSubcategory.id);
                  setSelectedSubcategory(null);
                }
              }}
            >
              Delete {selectedCategory ? 'Category' : 'Subcategory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
