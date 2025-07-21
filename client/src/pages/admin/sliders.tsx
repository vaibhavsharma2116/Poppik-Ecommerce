import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  Upload,
  X
} from "lucide-react";

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
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sliders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login again');
        }
        throw new Error(`Failed to fetch sliders: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      setSliders(data);
    } catch (err) {
      console.error('Error fetching sliders:', err);
      toast({
        title: "Error",
        description: "Failed to load sliders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/admin/sliders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login again');
        }
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const savedSlider = await response.json();
      setSliders(prev => [...prev, savedSlider]);
      toast({ title: "Image uploaded successfully" });

      // Reset form
      setSelectedImage(null);
      setImagePreview(null);
      setIsAddModalOpen(false);
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : 'Failed to upload image',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlider) return;

    try {
      const response = await fetch(`/api/admin/sliders/${selectedSlider.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login again');
        }
        throw new Error(`Failed to delete slider: ${response.status}`);
      }

      setSliders(prev => prev.filter(s => s.id !== selectedSlider.id));
      toast({ title: "Image deleted successfully" });
      setIsDeleteModalOpen(false);
      setSelectedSlider(null);
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : 'Failed to delete image',
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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading images...</p>
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
            Image Gallery
          </h2>
          <p className="text-slate-600 mt-1">Upload and manage your images</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedImage(null);
            setImagePreview(null);
            setIsAddModalOpen(true);
          }}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {/* Images Grid */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Uploaded Images</CardTitle>
          <CardDescription>Your image gallery</CardDescription>
        </CardHeader>
        <CardContent>
          {sliders.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sliders.map((slider) => (
                <div key={slider.id} className="relative group">
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <img 
                      src={slider.imageUrl} 
                      alt={`Image ${slider.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedSlider(slider);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    Uploaded: {new Date(slider.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setSelectedImage(null);
          setImagePreview(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Select an image file to upload
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
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

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setSelectedImage(null);
              setImagePreview(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleImageUpload} disabled={uploading || !selectedImage}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Image'
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
              Delete Image
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSlider && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-16 h-12 bg-white rounded flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedSlider.imageUrl} 
                  alt="Image to delete"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-slate-900">Image {selectedSlider.id}</p>
                <p className="text-sm text-slate-600">
                  Uploaded: {new Date(selectedSlider.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}