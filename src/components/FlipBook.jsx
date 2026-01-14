import React, { useState, useRef, useEffect, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";

const FlipBook = () => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const loadedImagesRef = useRef(new Set());
  const flipBookRef = useRef(null);

  // Generate image paths for all 23 pages
  const baseUrl = "https://hirusha.iio.to/catelog2";
  const images = Array.from({ length: 40 }, (_, i) => `${baseUrl}/images/${i + 1}.jpg`);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  // Filter images: remove first page on mobile
  const displayImages = isMobile ? images.slice(1) : images;

  const handleImageLoad = useCallback((index) => {
    if (!loadedImagesRef.current.has(index)) {
      loadedImagesRef.current.add(index);
      setLoadedCount(loadedImagesRef.current.size);
      console.log(`Image ${index + 1} loaded (${loadedImagesRef.current.size}/${images.length})`);
      
      // Mark as ready when at least 3 images are loaded
      const requiredImages = isMobile ? Math.min(3, displayImages.length) : 3;
      if (loadedImagesRef.current.size >= requiredImages) {
        setIsReady(true);
      }
    }
  }, [images.length, isMobile, displayImages.length]);

  const handleImageError = useCallback((index) => {
    console.error(`Failed to load image ${index + 1}`);
    handleImageLoad(index); // Count as loaded to not block initialization
  }, [handleImageLoad]);

  const flipNext = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const flipPrev = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  // Calculate dimensions based on container
  const getBookDimensions = () => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const padding = isMobile ? 20 : 80;
    const availableWidth = containerWidth - padding;
    const availableHeight = containerHeight - padding;

    // 4:3 aspect ratio
    const aspectRatio = 3 / 4; // height/width
    
    // For desktop: show 2 pages side by side, so width per page = total width / 2
    // For mobile: show 1 page, so width per page = total width
    const widthPerPage = isMobile ? availableWidth : availableWidth / 2;
    
    // Calculate height based on 4:3 ratio
    let pageHeight = widthPerPage * aspectRatio;
    let pageWidth = widthPerPage;
    
    // If height exceeds container, scale down
    if (pageHeight > availableHeight) {
      pageHeight = availableHeight;
      pageWidth = pageHeight / aspectRatio;
    }
    
    return {
      width: Math.round(pageWidth),
      height: Math.round(pageHeight)
    };
  };

  const [dimensions, setDimensions] = useState(getBookDimensions());

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getBookDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
      {/* Loading overlay */}
      {!isReady && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Catalog...</p>
          <p className="text-blue-400 text-sm mt-2">
            {Math.round((loadedCount / displayImages.length) * 100)}%
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      {isReady && (
        <>
          <button
            onClick={flipPrev}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all shadow-lg backdrop-blur-sm"
            aria-label="Previous page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={flipNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all shadow-lg backdrop-blur-sm"
            aria-label="Next page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Flipbook container */}
      <div className="relative w-full h-full flex items-center justify-center p-2 md:p-4 z-10">
        {isReady && (
          <HTMLFlipBook
            ref={flipBookRef}
            width={dimensions.width}
            height={dimensions.height}
            minWidth={200}
            maxWidth={2000}
            minHeight={150}
            maxHeight={2000}
            maxShadowOpacity={0.5}
            showCover={false}
            mobileScrollSupport={true}
            className="flipbook"
            style={{
              margin: '0 auto'
            }}
          >
            {displayImages.map((src, index) => {
              // Map display index back to original index for loading tracking
              const originalIndex = isMobile ? index + 1 : index;
              return (
                <div key={index} className="page bg-white">
                  <img
                    src={src}
                    alt={`Page ${originalIndex + 1}`}
                    onLoad={() => handleImageLoad(originalIndex)}
                    onError={(e) => handleImageError(originalIndex)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
              );
            })}
          </HTMLFlipBook>
        )}

        {/* Preload images */}
        <div className="hidden">
          {images.map((src, index) => (
            <img
              key={`preload-${index}`}
              src={src}
              alt=""
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlipBook;
