import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0);

  // Fetch sliders from API
  const { data: slidersData = [], isLoading, error } = useQuery<Slider[]>({
    queryKey: ['sliders'],
    queryFn: async () => {
      const response = await fetch('/api/sliders');
      if (!response.ok) {
        throw new Error('Failed to fetch sliders');
      }
      return response.json();
    },
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
    if (!isPlaying || !api) return;

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
  }, [api, isPlaying, autoplayDelay]);

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
      <div className="w-full h-[500px] relative">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-red-50">
        <p className="text-red-500">Failed to load hero banner: {(error as Error).message}</p>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No slides available</p>
      </div>
    );
  }

  return (
    <section className="relative" aria-label="Hero banner carousel">
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
              <div 
                className={`${slide.backgroundGradient || 'bg-gradient-to-r from-pink-50 to-purple-50'} py-20 relative overflow-hidden`}
                aria-roledescription="slide"
                aria-label={`Slide ${slide.id + 1} of ${slides.length}`}
              >
                {showProgress && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
                    <div 
                      className="h-full bg-red-500 transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 animate-fadeInLeft will-change-transform">
                      {slide.badge && (
                        <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                          {slide.badge}
                        </div>
                      )}

                      <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        {slide.title}{" "}
                        {slide.subtitle && <span className="text-red-500">{slide.subtitle}</span>}
                      </h1>

                      <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                        {slide.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          size="lg" 
                          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                          onClick={() => window.location.href = slide.primaryActionUrl}
                          aria-label={slide.primaryActionText}
                        >
                          {slide.primaryActionText}
                        </Button>

                        {slide.secondaryActionText && slide.secondaryActionUrl && (
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 rounded-full font-medium transition-all duration-300"
                            onClick={() => window.location.href = slide.secondaryActionUrl}
                            aria-label={slide.secondaryActionText}
                          >
                            {slide.secondaryActionText}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="relative animate-fadeInRight will-change-transform">
                      <img
                        src={slide.imageUrl}
                        alt={`Hero banner ${slide.title}`}
                        className="rounded-2xl shadow-2xl w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {showControls && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        <button
          onClick={togglePlayPause}
          className="absolute bottom-6 right-6 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-gray-800" />
          ) : (
            <Play className="w-5 h-5 text-gray-800 ml-0.5" />
          )}
        </button>

        {showIndicators && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                    index === current ? 'bg-red-500 scale-125' : 'bg-white/60 hover:bg-white/80'
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === current ? "true" : "false"}
                >
                  {index === current && (
                    <div 
                      className="absolute inset-0 bg-red-500 rounded-full transition-all duration-100"
                      style={{ 
                        clipPath: `inset(0 ${100 - progress}% 0 0)`,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="absolute top-6 right-6 z-20 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
          {current + 1} / {slides.length}
        </div>
      </Carousel>
    </section>
  );
}