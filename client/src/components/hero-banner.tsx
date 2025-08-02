import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";

interface Slider {
  id: number;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

const fetchSliders = async (): Promise<Slider[]> => {
  const response = await fetch('/api/sliders');
  if (!response.ok) {
    throw new Error('Failed to fetch sliders');
  }
  return response.json();
};

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0);

  // Fetch sliders from API
  const { data: slidersData = [], isLoading, error } = useQuery<Slider[]>({
    queryKey: ['sliders'],
    queryFn: fetchSliders,
  });

  // Filter only active sliders and sort by sortOrder
  const slides = slidersData.filter(slider => slider.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0);
    });
  }, [api]);

  useEffect(() => {
    if (!isPlaying || !api || slides.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (api.canScrollNext()) {
            api.scrollNext();
          } else {
            api.scrollTo(0);
          }
          return 0;
        }
        return prev + (100 / (autoplayDelay / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [api, isPlaying, autoplayDelay, slides.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToSlide = (index: number) => {
    api?.scrollTo(index);
    setProgress(0);
  };

  const nextSlide = () => {
    if (api?.canScrollNext()) {
      api.scrollNext();
    } else {
      api?.scrollTo(0);
    }
    setProgress(0);
  };

  const prevSlide = () => {
    if (api?.canScrollPrev()) {
      api.scrollPrev();
    } else {
      api?.scrollTo(slides.length - 1);
    }
    setProgress(0);
  };

  if (isLoading) {
    return (
      <div className="hero-slider-container">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hero-slider-container bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="slider-title text-gray-800 mb-4">Welcome to Our Store</h1>
          <p className="slider-subtitle text-gray-600">Discover amazing products</p>
          <p className="text-red-500 text-sm mt-2">Failed to load slider: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="hero-slider-container bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="slider-title text-gray-800 mb-4">Welcome to Our Store</h1>
          <p className="slider-subtitle text-gray-600">Discover amazing products</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full" aria-label="Hero banner carousel">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="hero-slider-container">
                {showProgress && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
                    <div 
                      className="h-full bg-red-500 transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                      aria-hidden="true"
                    />
                  </div>
                )}

                <img 
                  src={slide.imageUrl} 
                  alt={`Slide ${slide.id}`}
                  className="hero-slider-image"
                  loading="lazy"
                />
</div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {showControls && (
          <>
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="carousel-nav-button carousel-prev"
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(autoplay)}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>

            <button
              onClick={nextSlide}
              className="carousel-nav-button carousel-next"
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(autoplay)}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
          aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-gray-800" />
          ) : (
            <Play className="w-4 h-4 text-gray-800" />
          )}
        </button>

        {/* Slide Counter */}
        <div className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
          {current + 1} / {slides.length}
        </div>
      </Carousel>

      {/* Indicators */}
      {showIndicators && (
        <div className="slider-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`slider-indicator ${current === index ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </section>
  );
}