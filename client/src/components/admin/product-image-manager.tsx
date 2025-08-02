import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Star, StarOff, Move, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

interface ProductImagesManagerProps {
  productId: number;
  onImagesChange?: () => void;
}

export default function ProductImagesManager({ productId, onImagesChange }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('altText', altText);
      formData.append('isPrimary', isPrimary.toString());
      formData.append('sortOrder', sortOrder.toString());

      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Image uploaded",
          description: "Product image has been added successfully",
        });

        setIsAddModalOpen(false);
        setSelectedFile(null);
        setAltText('');
        setIsPrimary(false);
        setSortOrder(0);
        fetchImages();
        onImagesChange?.();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const togglePrimary = async (imageId: number, currentPrimary: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPrimary: !currentPrimary }),
      });

      if (response.ok) {
        toast({
          title: currentPrimary ? "Primary removed" : "Primary set",
          description: `Image ${currentPrimary ? 'is no longer' : 'is now'} the primary image`,
        });
        fetchImages();
        onImagesChange?.();
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update image status",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Image deleted",
          description: "Product image has been removed",
        });
        fetchImages();
        onImagesChange?.();
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (response.ok) {
        fetchImages();
        onImagesChange?.();
        toast({
          title: "Primary image updated",
          description: "The image has been set as primary",
        });
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
    }
  };

  const handleReorderImage = async (imageId: number, newSortOrder: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sortOrder: newSortOrder }),
      });

      if (response.ok) {
        fetchImages();
        onImagesChange?.();
        toast({
          title: "Image reordered",
          description: "The image order has been updated",
        });
      }
    } catch (error) {
      console.error('Error reordering image:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Images</CardTitle>
          <p className="text-sm text-gray-600">Manage multiple images for this product</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product Image</DialogTitle>
              <DialogDescription>
                Upload a new image for this product
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-file">Image File</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
              <div>
                <Label htmlFor="alt-text">Alt Text (Optional)</Label>
                <Input
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
              <div>
                <Label htmlFor="sort-order">Sort Order</Label>
                <Input
                  id="sort-order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-primary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                />
                <Label htmlFor="is-primary">Set as primary image</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.altText || 'Product image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 left-2 flex space-x-1">
                  {image.isPrimary && (
                    <Badge className="bg-green-500">Primary</Badge>
                  )}
                  <Badge variant="secondary">#{image.sortOrder}</Badge>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <Button
                    size="sm"
                    variant={image.isPrimary ? "default" : "outline"}
                    onClick={() => togglePrimary(image.id, image.isPrimary)}
                    className="h-8 w-8 p-0"
                  >
                    {image.isPrimary ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImage(image.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {image.altText && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {image.altText}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}