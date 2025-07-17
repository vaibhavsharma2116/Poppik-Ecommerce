import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Image as ImageIcon,
  Loader2,
  ArrowUp,
  ArrowDown,
  Upload,
  X
} from "lucide-react";
import { ChromePicker } from 'react-color'; // Import ChromePicker

interface Slider {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  badge?: string;
  primaryActionText: string;
  primaryActionUrl: string;
  secondaryActionText?: string;
  secondaryActionUrl?: string;
  backgroundGradient?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSliders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [showColorPicker, setShowColorPicker] = useState(false);


  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    badge: '',
    primaryActionText: '',
    primaryActionUrl: '',
    secondaryActionText: '',
    secondaryActionUrl: '',
    backgroundGradient: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sliders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sliders');
      }
      const data = await response.json();
      setSliders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = formData.imageUrl;

      // Upload image if a new one is selected
      if (selectedImage) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          return; // Stop if image upload failed
        }
      }

      const submissionData = {
        ...formData,
        imageUrl
      };

      const url = selectedSlider ? `/api/admin/sliders/${selectedSlider.id}` : '/api/admin/sliders';
      const method = selectedSlider ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save slider');
      }

      const savedSlider = await response.json();

      if (selectedSlider) {
        setSliders(prev => prev.map(s => s.id === selectedSlider.id ? savedSlider : s));
        toast({ title: "Slider updated successfully" });
      } else {
        setSliders(prev => [...prev, savedSlider]);
        toast({ title: "Slider created successfully" });
      }

      resetForm();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : 'Failed to save slider',
        variant: "destructive"
      });
    }
  };

  const handleEdit = (slider: Slider) => {
    setSelectedSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle || '',
      description: slider.description,
      imageUrl: slider.imageUrl,
      badge: slider.badge || '',
      primaryActionText: slider.primaryActionText,
      primaryActionUrl: slider.primaryActionUrl,
      secondaryActionText: slider.secondaryActionText || '',
      secondaryActionUrl: slider.secondaryActionUrl || '',
      backgroundGradient: slider.backgroundGradient || '',
      isActive: slider.isActive,
      sortOrder: slider.sortOrder
    });
    setImagePreview(slider.imageUrl);
    setSelectedImage(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSlider) return;

    try {
      const response = await fetch(`/api/admin/sliders/${selectedSlider.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete slider');
      }

      setSliders(prev => prev.filter(s => s.id !== selectedSlider.id));
      toast({ title: "Slider deleted successfully" });
      setIsDeleteModalOpen(false);
      setSelectedSlider(null);
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : 'Failed to delete slider',
        variant: "destructive"
      });
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      badge: '',
      primaryActionText: '',
      primaryActionUrl: '',
      secondaryActionText: '',
      secondaryActionUrl: '',
      backgroundGradient: '',
      isActive: true,
      sortOrder: 0
    });
    setSelectedSlider(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const filteredSliders = sliders.filter(slider =>
    slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slider.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleColorChange = (color: any) => {
        setFormData(prev => ({ ...prev, backgroundGradient: color.hex }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Slider Management
          </h2>
          <p className="text-slate-600 mt-1">Manage your homepage banner slides</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Slide
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search slides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sliders Table */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Banner Slides</CardTitle>
          <CardDescription>Manage your homepage banner carousel slides</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSliders.map((slider) => (
                <TableRow key={slider.id} className="hover:bg-slate-50/80">
                  <TableCell>
                    <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {slider.imageUrl ? (
                        <img 
                          src={slider.imageUrl} 
                          alt={slider.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900">{slider.title}</div>
                      {slider.subtitle && (
                        <div className="text-sm text-slate-500">{slider.subtitle}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-slate-600">
                      {slider.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={slider.isActive ? 'default' : 'secondary'}>
                      {slider.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{slider.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(slider)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedSlider(slider);
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

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSlider ? 'Edit Slide' : 'Add New Slide'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Main title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Subtitle (optional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Slide description"
                rows={3}
                required
              />
            </div>

            
<div className="space-y-2">
                <Label>Banner Image *</Label>
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="slider-image-upload"
                    />
                    <Label
                      htmlFor="slider-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </Label>
                    {selectedImage && (
                      <p className="text-sm text-green-600 mt-2">Selected: {selectedImage.name}</p>
                    )}
                  </CardContent>
                </Card>
              </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="New Collection"
                />
              </div>
              
              <div className="space-y-2">
                    <Label htmlFor="backgroundGradient">Background Gradient</Label>
                    <Button variant="outline" onClick={() => setShowColorPicker(show => !show)}>
                        {showColorPicker ? "Close Color Picker" : "Pick a Color"}
                    </Button>
                    {showColorPicker && (
                        <ChromePicker color={formData.backgroundGradient} onChange={handleColorChange} />
                    )}
                    {formData.backgroundGradient && (
                        <div className="mt-2">
                            Selected Color: {formData.backgroundGradient}
                            <div
                                style={{
                                    width: '50px',
                                    height: '20px',
                                    backgroundColor: formData.backgroundGradient,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryActionText">Primary Button Text *</Label>
                <Input
                  id="primaryActionText"
                  value={formData.primaryActionText}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryActionText: e.target.value }))}
                  placeholder="Shop Now"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryActionUrl">Primary Button URL *</Label>
                <Input
                  id="primaryActionUrl"
                  value={formData.primaryActionUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryActionUrl: e.target.value }))}
                  placeholder="/products"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secondaryActionText">Secondary Button Text</Label>
                <Input
                  id="secondaryActionText"
                  value={formData.secondaryActionText}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryActionText: e.target.value }))}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryActionUrl">Secondary Button URL</Label>
                <Input
                  id="secondaryActionUrl"
                  value={formData.secondaryActionUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryActionUrl: e.target.value }))}
                  placeholder="/about"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                selectedSlider ? 'Update Slide' : 'Create Slide'
              )}
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
              Delete Slide
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slide? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSlider && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-12 h-8 bg-white rounded flex items-center justify-center overflow-hidden">
                {selectedSlider.imageUrl ? (
                  <img 
                    src={selectedSlider.imageUrl} 
                    alt={selectedSlider.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedSlider.title}</p>
                <p className="text-sm text-slate-600">{selectedSlider.subtitle}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Slide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}