"use client";

import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-utils';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';

interface Slide {
  mediaType: 'image' | 'video';
  media: string;
  headline: string;
  headlineSize: string;
  headlineColor: string;
  headlineAlignment: 'left' | 'center' | 'right';
  subtext: string;
  subtextSize: string;
  subtextColor: string;
  subtextAlignment: 'left' | 'center' | 'right';
  cta: string;
  ctaLink: string;
  showText?: boolean;
}

interface HeroContent {
  slides: Slide[];
  autoPlay: boolean;
  transitionSpeed: number;
  showDots?: boolean;
  showArrows?: boolean;
}

interface HeroBannerPreviewProps {
  heroContent: HeroContent;
  selectedSlideIndex: number;
}

export default function HeroBannerPreview({ heroContent, selectedSlideIndex }: HeroBannerPreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (heroContent.slides && heroContent.slides.length > 0) {
      setCurrentSlideIndex(0);
    }
  }, [heroContent.slides]);

  // Auto-play functionality
  useEffect(() => {
    if (heroContent.slides && heroContent.slides.length > 1 && heroContent.autoPlay) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % heroContent.slides.length);
      }, (heroContent.transitionSpeed || 5) * 1000);
      return () => clearInterval(interval);
    }
  }, [heroContent.slides, heroContent.autoPlay, heroContent.transitionSpeed]);

  if (!heroContent.slides || heroContent.slides.length === 0) {
    return (
      <div className="w-full max-w-4xl aspect-3/1 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No slides to preview</p>
      </div>
    );
  }


  const renderSlide = (slide: Slide, index: number, isActive: boolean = false) => {
    const { mediaType, media, headline, headlineSize, headlineColor, headlineAlignment, subtext, subtextSize, subtextColor, subtextAlignment, cta, ctaLink, showText } = slide;

    // Determine if media is video based on type or file extension
    const isVideo = mediaType === 'video' || (media && (media.includes('.mp4') || media.includes('.webm') || media.includes('.ogg')));

    return (
      <div className={`w-full h-full px-2 transition-all duration-700 ease-out transform-gpu ${isActive ? 'scale-105 opacity-100' : 'scale-95 opacity-70'}`}>
        <div className="relative w-full aspect-3/1  rounded-lg overflow-hidden shadow-lg">
          {/* Background Media */}
          {media && media.trim() !== "" && (
            <div className="absolute inset-0">
              {isVideo ? (
                <video
                  src={media}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  onError={(e) => {
                    console.error("Video failed to load:", media);
                    const target = e.target as HTMLVideoElement;
                    target.style.display = "none";
                    const fallbackImg = target.nextElementSibling as HTMLImageElement;
                    if (fallbackImg) {
                      fallbackImg.style.display = "block";
                    }
                  }}
                />
              ) : null}
              <img
                src={
                  media && media.trim() !== ""
                    ? getOptimizedImageUrl(media, {
                        width: 800,
                        height: 267,
                        quality: 85,
                        format: "auto",
                        crop: "fill",
                        gravity: "auto",
                      })
                    : "/placeholder.png"
                }
                alt="Hero background"
                className={`w-full h-full object-cover ${isVideo ? "hidden" : ""}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.png";
                }}
              />
              {(!media || media.trim() === "") && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-opacity-40"></div>

          {/* Text Content */}
          {showText !== false && (
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-white">
              {headline && (
                <h1
                  className={`font-bold mb-2 text-sm ${headlineSize} ${
                    headlineAlignment === "left"
                      ? "text-left"
                      : headlineAlignment === "right"
                      ? "text-right"
                      : "text-center"
                  }`}
                  style={{ color: headlineColor }}
                >
                  {headline}
                </h1>
              )}
              {subtext && (
                <p
                  className={`mb-3 text-xs ${subtextSize} ${
                    subtextAlignment === "left"
                      ? "text-left"
                      : subtextAlignment === "right"
                      ? "text-right"
                      : "text-center"
                  }`}
                  style={{ color: subtextColor }}
                >
                  {subtext}
                </p>
              )}
              {cta && (
                <a
                  href={ctaLink || "#"}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  {cta}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate visible slides (show 3 at a time, centered)
  const getVisibleSlides = (): Array<{ slide: Slide; index: number; isActive: boolean }> => {
    const total = heroContent.slides.length;
    if (total <= 3) {
      return heroContent.slides.map((slide, index) => ({
        slide,
        index,
        isActive: index === currentSlideIndex
      }));
    }

    const slides: Array<{ slide: Slide; index: number; isActive: boolean }> = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentSlideIndex + i + total) % total;
      slides.push({
        slide: heroContent.slides[index],
        index,
        isActive: i === 0
      });
    }
    return slides;
  };

  return (
    <div className="w-full  rounded-lg overflow-hidden relative">
      {/* Carousel Container */}
      <div className="relative w-full overflow-hidden py-4">
        <div className="flex justify-center items-center h-full">
          {getVisibleSlides().map(({ slide, index, isActive }, arrayIndex) => (
            <div
              key={index}
              className={`transition-all duration-700 ease-out transform-gpu ${
                arrayIndex === 0 ? 'basis-1/5' : arrayIndex === 1 ? 'basis-3/5' : 'basis-1/5'
              }`}
            >
              {renderSlide(slide, index, isActive)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {heroContent.slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : heroContent.slides.length - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full p-2 z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentSlideIndex(prev => prev < heroContent.slides.length - 1 ? prev + 1 : 0)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full p-2 z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {heroContent.slides.length > 1 && (
        <div className="flex absolute bottom-2 mx-auto w-full justify-center mt-4 space-x-2">
          {heroContent.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentSlideIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}

      {/* Preview Label */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs z-20">
        Preview
      </div>
    </div>
  );
}