import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductImageGalleryProps {
  productId: number;
  fallbackImage: string;
  productName: string;
  selectedShade?: any;
}

export default function ProductImageGallery({ 
  productId, 
  fallbackImage, 
  productName,
  selectedShade 
}: ProductImageGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/images`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setImages(data);
        } else {
          // Use fallback image if no images are found
          setImages([{
            id: 0,
            productId,
            imageUrl: fallbackImage,
            altText: productName,
            isPrimary: true,
            sortOrder: 0
          }]);
        }
      } else {
        // Use fallback image on error
        setImages([{
          id: 0,
          productId,
          imageUrl: fallbackImage,
          altText: productName,
          isPrimary: true,
          sortOrder: 0
        }]);
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
      // Use fallback image on error
      setImages([{
        id: 0,
        productId,
        imageUrl: fallbackImage,
        altText: productName,
        isPrimary: true,
        sortOrder: 0
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Prepare images array with shade image if selected
  const displayImages = useMemo(() => {
    if (selectedShade?.imageUrl && images.length > 0) {
      // Check if shade image already exists in the gallery
      const shadeImageExists = images.some(img => img.imageUrl === selectedShade.imageUrl);
      if (!shadeImageExists) {
        // Add shade image as the first image
        return [
          {
            id: -1,
            productId,
            imageUrl: selectedShade.imageUrl,
            altText: `${productName} in ${selectedShade.name}`,
            isPrimary: true,
            sortOrder: -1
          },
          ...images
        ];
      }
    }
    return images.length > 0 ? images : [
      {
        id: 0,
        productId,
        imageUrl: fallbackImage,
        altText: productName,
        isPrimary: true,
        sortOrder: 0
      }
    ];
  }, [images, selectedShade, fallbackImage, productName, productId]);

  const currentImage = displayImages[currentImageIndex];
  const showNavigation = displayImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-xl sm:rounded-3xl blur-xl sm:blur-2xl group-hover:blur-2xl sm:group-hover:blur-3xl transition-all duration-500"></div>

      <div className="relative bg-white rounded-xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-white/20">
        {/* Main Image */}
        <div className="aspect-square relative overflow-hidden">
          <img
            src={currentImage.imageUrl}
            alt={currentImage.altText || productName}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            style={{
              transition: 'opacity 0.3s ease-in-out'
            }}
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onLoadStart={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          />

          {/* Navigation Arrows */}
          {showNavigation && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {showNavigation && (
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          )}

          {/* Shade Selection Indicator */}
          {selectedShade && (
            <div className="absolute bottom-4 left-4 bg-purple-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
              {selectedShade.name} Shade
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {showNavigation && (
          <div className="p-4 bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto">
              {displayImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `${productName} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}