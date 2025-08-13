
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Slider {
  id: number;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface HeroBannerProps {
  autoplay?: boolean;
  autoplayDelay?: number;
  showIndicators?: boolean;
  showProgress?: boolean;
  showControls?: boolean;
}

export default function HeroBanner({
  autoplay = true,
  autoplayDelay = 5000,
  showIndicators = true,
  showProgress = true,
  showControls = true,
}: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fetch sliders from API
  const {
    data: slidersData = [],
    isLoading,
    error,
  } = useQuery<Slider[]>({
    queryKey: ["sliders"],
    queryFn: async () => {
      const response = await fetch("/api/sliders");
      if (!response.ok) {
        throw new Error("Failed to fetch sliders");
      }
      return response.json();
    },
  });

  // Filter only active sliders and sort by sortOrder
  const slides = slidersData
    .filter((slider) => slider.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((current) => (current + 1) % slides.length);
          return 0;
        }
        return prev + 100 / (autoplayDelay / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length, autoplayDelay]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setCurrentSlide((current) => (current + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((current) => (current - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] relative">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-500 text-sm text-center px-4">
          Failed to load hero banner: {(error as Error).message}
        </p>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No slides available</p>
      </div>
    );
  }

  return (
    <section className="relative w-full mx-auto max-w-7xl" aria-label="Hero banner carousel">
      <div 
        className="relative overflow-hidden rounded-xl bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress bar */}
        {showProgress && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200/50 z-20">
            <div
              className="h-full bg-white/80 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Slides container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="w-full flex-shrink-0">
              <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] lg:h-[440px] xl:h-[520px]">
                <img
                  src={slide.imageUrl}
                  alt={`Slide ${slide.id}`}
                  className="w-full h-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* Optional overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        {showControls && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 touch-manipulation"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 touch-manipulation"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </>
        )}

        {/* Play/Pause button */}
        {autoplay && (
          <button
            onClick={togglePlayPause}
            className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 touch-manipulation"
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            ) : (
              <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            )}
          </button>
        )}

        {/* Slide indicators */}
        {showIndicators && slides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 touch-manipulation ${
                    index === currentSlide
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Slide counter */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 bg-black/30 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 text-white text-xs sm:text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </section>
  );
}
