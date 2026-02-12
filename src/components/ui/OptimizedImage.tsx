"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/s3-upload";

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate optimized URLs for different sizes
  const getResponsiveSrcSet = (url: string) => {
    if (!url) return undefined;
    
    // Check if it's a CloudFront URL
    const isCloudFront = url.includes('cloudfront.net');
    
    if (isCloudFront) {
      const sizes = [400, 800, 1200, 1600];
      return sizes
        .map((w) => `${getOptimizedImageUrl(url, { width: w, quality: 85 })} ${w}w`)
        .join(", ");
    }
    
    return undefined;
  };

  // Get the best optimized URL for the given dimensions
  const getOptimizedSrc = (url: string) => {
    if (!url) return "";
    const isCloudFront = url.includes('cloudfront.net');
    if (isCloudFront) {
      return getOptimizedImageUrl(url, { width, height, quality: 85 });
    }
    return url;
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "bg-gray-200 flex items-center justify-center",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-gray-400 text-xs">No image</span>
      </div>
    );
  }

  const optimizedSrc = getOptimizedSrc(src);
  const srcSet = getResponsiveSrcSet(src);

  return (
    <div className={cn("relative", fill ? "absolute inset-0" : "", className)}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-500 animate-pulse z-10"
          style={!fill ? { width, height } : undefined}
        />
      )}
      <Image
        src={optimizedSrc}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "object-contain transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill ? "inset-0" : ""
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}
