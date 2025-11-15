import { useEffect, useRef, useState } from 'react';

interface UseLazyImageOptions {
  /**
   * The actual image URL to load when in viewport
   */
  src: string;

  /**
   * Optional low-resolution placeholder or base64 thumbnail
   */
  placeholder?: string;

  /**
   * How far from viewport to start loading (default: 200px)
   */
  rootMargin?: string;

  /**
   * Threshold for intersection (default: 0.01)
   */
  threshold?: number;
}

interface UseLazyImageResult {
  /**
   * The current image source (placeholder or full image)
   */
  imageSrc: string;

  /**
   * Whether the full image has been loaded
   */
  isLoaded: boolean;

  /**
   * Whether the image is currently loading
   */
  isLoading: boolean;

  /**
   * Ref to attach to the image container element
   */
  ref: React.RefObject<HTMLDivElement>;
}

/**
 * Custom hook for lazy-loading images with IntersectionObserver
 *
 * Features:
 * - Loads full-resolution images only when near viewport
 * - Supports placeholder thumbnails for progressive loading
 * - Configurable intersection thresholds
 * - Automatic cleanup on unmount
 *
 * @example
 * const { imageSrc, isLoaded, isLoading, ref } = useLazyImage({
 *   src: '/screenshots/full-res.png',
 *   placeholder: '/screenshots/thumb.png',
 *   rootMargin: '200px'
 * });
 *
 * return (
 *   <div ref={ref}>
 *     <img src={imageSrc} alt="Screenshot" />
 *   </div>
 * );
 */
export function useLazyImage({
  src,
  placeholder = '',
  rootMargin = '200px',
  threshold = 0.01,
}: UseLazyImageOptions): UseLazyImageResult {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Early return if no src or already loaded
    if (!src || isLoaded) return;

    const element = ref.current;
    if (!element) return;

    // Create IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded && !isLoading) {
            setIsLoading(true);

            // Preload the full-resolution image
            const img = new Image();
            img.src = src;

            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              setIsLoading(false);

              // Unobserve after loading
              if (observerRef.current && element) {
                observerRef.current.unobserve(element);
              }
            };

            img.onerror = () => {
              // Keep placeholder on error
              setIsLoading(false);
              console.error(`Failed to load image: ${src}`);
            };
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [src, placeholder, rootMargin, threshold, isLoaded, isLoading]);

  return {
    imageSrc,
    isLoaded,
    isLoading,
    ref,
  };
}
