
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
import AddProductModal from "@/components/admin/add-product-modal";
import { Product } from "@/lib/types";
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
  Image as ImageIcon
} from "lucide-react";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: "Moisturizing Face Cream", 
      category: "Skincare", 
      price: "29.99", 
      stock: 45, 
      status: "Active",
      rating: "4.8",
      sales: 234,
      image: "/api/placeholder/150/150"
    },
    { 
      id: 2, 
      name: "Red Velvet Lipstick", 
      category: "Makeup", 
      price: "19.99", 
      stock: 23, 
      status: "Active",
      rating: "4.6",
      sales: 189,
      image: "/api/placeholder/150/150"
    },
    { 
      id: 3, 
      name: "Body Lotion Vanilla", 
      category: "Body Care", 
      price: "15.99", 
      stock: 0, 
      status: "Out of Stock",
      rating: "4.3",
      sales: 67,
      image: "/api/placeholder/150/150"
    },
    { 
      id: 4, 
      name: "Rose Water Toner", 
      category: "Skincare", 
      price: "12.99", 
      stock: 67, 
      status: "Active",
      rating: "4.9",
      sales: 345,
      image: "/api/placeholder/150/150"
    },
    { 
      id: 5, 
      name: "Matte Foundation", 
      category: "Makeup", 
      price: "34.99", 
      stock: 12, 
      status: "Low Stock",
      rating: "4.4",
      sales: 156,
      image: "/api/placeholder/150/150"
    },
  ]);

  const handleAddProduct = (newProduct: any) => {
    const productWithId = {
      ...newProduct,
      id: Date.now()
    };
    setProducts(prev => [...prev, productWithId]);
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    status: ''
  });

  const handleEditProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setEditFormData({
        name: product.name,
        price: product.price,
        stock: product.stock.toString(),
        category: product.category,
        status: product.status
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedProduct) {
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { 
              ...p, 
              name: editFormData.name,
              price: editFormData.price,
              stock: parseInt(editFormData.stock),
              category: editFormData.category,
              status: editFormData.status
            }
          : p
      ));
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleViewProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsViewModalOpen(true);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleMoreFilters = () => {
    const sortOptions = ['Name (A-Z)', 'Name (Z-A)', 'Price (Low to High)', 'Price (High to Low)', 'Stock (Low to High)', 'Rating (High to Low)'];
    const selected = prompt(`Choose sort option:\n${sortOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nEnter number (1-6):`);
    
    if (selected && parseInt(selected) >= 1 && parseInt(selected) <= 6) {
      const sortIndex = parseInt(selected) - 1;
      let sortedProducts = [...products];
      
      switch (sortIndex) {
        case 0: // Name A-Z
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 1: // Name Z-A
          sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 2: // Price Low to High
          sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 3: // Price High to Low
          sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 4: // Stock Low to High
          sortedProducts.sort((a, b) => a.stock - b.stock);
          break;
        case 5: // Rating High to Low
          sortedProducts.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
      }
      setProducts(sortedProducts);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
                           product.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
                         product.status.toLowerCase().replace(' ', '-') === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockCount = products.filter(p => p.status === "Low Stock" || p.stock < 15).length;
  const bestSeller = products.reduce((prev, current) => (prev.sales > current.sales) ? prev : current);

  const stats = [
    { label: "Total Products", value: products.length.toString(), icon: Package, color: "from-blue-500 to-cyan-500" },
    { label: "Low Stock", value: lowStockCount.toString(), icon: AlertTriangle, color: "from-orange-500 to-red-500" },
    { label: "Best Seller", value: bestSeller?.name || "N/A", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Product Management
          </h2>
          <p className="text-slate-600 mt-1">Manage your beauty product inventory and catalog</p>
        </div>
        <AddProductModal onAddProduct={handleAddProduct} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="skincare">Skincare</SelectItem>
                  <SelectItem value="makeup">Makeup</SelectItem>
                  <SelectItem value="body-care">Body Care</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
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

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <div className="aspect-square bg-slate-100 rounded-t-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-400" />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <Badge 
                  className={`absolute top-2 left-2 ${
                    product.status === 'Active' ? 'bg-green-500' :
                    product.status === 'Low Stock' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                >
                  {product.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{product.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-slate-900">${product.price}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-slate-600">{product.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                  <span>Stock: {product.stock}</span>
                  <span>{product.sales} sales</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    onClick={() => handleDeleteProduct(product.id)}
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
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Detailed view of all products</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/80">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{product.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-medium">${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {product.rating}
                      </div>
                    </TableCell>
                    <TableCell>{product.sales}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          product.status === 'Active' ? 'default' :
                          product.status === 'Low Stock' ? 'secondary' : 'destructive'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 transition-all hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => handleViewProduct(product.id)}
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 transition-all hover:bg-emerald-100 hover:text-emerald-600"
                          onClick={() => handleEditProduct(product.id)}
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 transition-all hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete Product"
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

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              Product Details
            </DialogTitle>
            <DialogDescription className="text-base">
              Complete information and analytics for the selected product
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-8 pt-6">
              {/* Product Header */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-inner">
                  <ImageIcon className="h-12 w-12 text-slate-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {selectedProduct.category}
                      </Badge>
                      <Badge 
                        className={`text-sm px-3 py-1 ${
                          selectedProduct.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                          selectedProduct.status === 'Low Stock' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                          'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {selectedProduct.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${
                              i < Math.floor(parseFloat(selectedProduct.rating)) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-slate-300"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-slate-700">{selectedProduct.rating}</span>
                      <span className="text-slate-500">({selectedProduct.sales} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">${selectedProduct.price}</div>
                    <div className="text-sm text-green-600 font-medium">Current Price</div>
                  </div>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">{selectedProduct.stock}</div>
                    <div className="text-sm text-blue-600 font-medium">Units in Stock</div>
                  </div>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">{selectedProduct.sales}</div>
                    <div className="text-sm text-purple-600 font-medium">Total Sales</div>
                  </div>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700">${(parseFloat(selectedProduct.price) * selectedProduct.sales).toFixed(0)}</div>
                    <div className="text-sm text-orange-600 font-medium">Revenue</div>
                  </div>
                </Card>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Information */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-slate-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-slate-600" />
                      Product Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Category</Label>
                        <p className="text-base text-slate-900 mt-1">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Product ID</Label>
                        <p className="text-base text-slate-900 mt-1 font-mono">#{selectedProduct.id}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Description</Label>
                      <p className="text-base text-slate-700 mt-2 leading-relaxed">
                        {selectedProduct.description || "No description available for this product. This premium beauty product is carefully crafted to meet the highest quality standards."}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Short Description</Label>
                      <p className="text-base text-slate-700 mt-2">
                        {selectedProduct.shortDescription || "Premium beauty product with exceptional quality and results."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Analytics */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-slate-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-slate-600" />
                      Performance Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Stock Status</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedProduct.status === 'Active' ? 'bg-green-500' :
                            selectedProduct.status === 'Low Stock' ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-semibold">{selectedProduct.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Inventory Health</span>
                        <span className={`text-sm font-semibold ${
                          selectedProduct.stock > 20 ? 'text-green-600' :
                          selectedProduct.stock > 5 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {selectedProduct.stock > 20 ? 'Healthy' :
                           selectedProduct.stock > 5 ? 'Monitor' : 'Critical'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Customer Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{selectedProduct.rating}/5.0</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Sales Performance</span>
                        <span className={`text-sm font-semibold ${
                          selectedProduct.sales > 200 ? 'text-green-600' :
                          selectedProduct.sales > 100 ? 'text-orange-600' : 'text-slate-600'
                        }`}>
                          {selectedProduct.sales > 200 ? 'Excellent' :
                           selectedProduct.sales > 100 ? 'Good' : 'Average'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 text-base font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditProduct(selectedProduct.id);
                  }}
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Product
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 text-base font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleDeleteProduct(selectedProduct.id);
                  }}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete Product
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 transition-all"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Product
            </DialogTitle>
            <DialogDescription>
              Update product information and save changes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editFormData.stock}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skincare">Skincare</SelectItem>
                  <SelectItem value="Makeup">Makeup</SelectItem>
                  <SelectItem value="Body Care">Body Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
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
              Delete Product
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this product?
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedProduct.name}</p>
                <p className="text-sm text-slate-600">{selectedProduct.category} • ${selectedProduct.price}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
