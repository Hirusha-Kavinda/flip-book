import React, { useState, useRef, useEffect, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

const FlipBook = () => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const loadedImagesRef = useRef(new Set());
  const flipBookRef = useRef(null);
  const fancyboxContainerRef = useRef(null);

  // Generate image paths for all 40 pages
  //const baseUrl = "https://hirusha.iio.to/catelog2";
  const baseUrl = "https://hirusha.iio.to/catelog2";
  const images = Array.from({ length: 39 }, (_, i) => `${baseUrl}/images/${i + 1}.jpg`);
  const displayImages = images;

  const handleImageLoad = useCallback((index) => {
    if (!loadedImagesRef.current.has(index)) {
      loadedImagesRef.current.add(index);
      setLoadedCount(loadedImagesRef.current.size);
      console.log(`Image ${index + 1} loaded (${loadedImagesRef.current.size}/${images.length})`);
      
      // Mark as ready when at least 3 images are loaded
      const requiredImages = Math.min(3, displayImages.length);
      if (loadedImagesRef.current.size >= requiredImages) {
        setIsReady(true);
      }
    }
  }, [images.length, displayImages.length]);

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

  const onFlip = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  // Initialize Fancybox when component is ready
  useEffect(() => {
    if (isReady && fancyboxContainerRef.current) {
      Fancybox.bind(fancyboxContainerRef.current, "[data-fancybox='gallery']", {
        Thumbs: {
          autoStart: false,
        },
        Toolbar: {
          display: {
            left: ["infobar"],
            middle: [],
            right: ["slideshow", "download", "thumbs", "close"],
          },
        },
        Carousel: {
          infinite: true,
        },
      });

      return () => {
        Fancybox.unbind(fancyboxContainerRef.current);
        Fancybox.close();
      };
    }
  }, [isReady]);

  // Handle center area click - prevent page flip when clicking center
  const handleCenterClick = useCallback((e) => {
    // Stop event propagation to prevent page flip
    e.stopPropagation();
    // Allow Fancybox to handle the click via data-fancybox attribute
  }, []);

  // Calculate dimensions based on container
  const getBookDimensions = () => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const padding = containerWidth < 1200 ? 40 : 80;
    const availableWidth = containerWidth - padding;
    const availableHeight = containerHeight - padding;

    // 4:3 aspect ratio
    const aspectRatio = 3 / 4; // height/width
    
    // For screens under 1200px, use full width for single page
    // For larger screens, use half width for double page spread
    const isMobile = containerWidth < 1200;
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
      height: Math.round(pageHeight),
      isMobile
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
    <div className="w-full h-screen flex items-center justify-center overflow-hidden">
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
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-teal-500/20 hover:bg-teal-600/20 text-white p-3 md:p-4 rounded-full transition-all shadow-lg backdrop-blur-sm"
            aria-label="Previous page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={flipNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-teal-500/20 hover:bg-teal-600/20 text-white p-3 md:p-4 rounded-full transition-all shadow-lg backdrop-blur-sm"
            aria-label="Next page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Flipbook container */}
      <div 
        ref={fancyboxContainerRef}
        className="relative w-full h-full flex items-center justify-center p-2 md:p-4 z-10"
      >
        {isReady && (
          <div style={{ 
            display: 'flex', 
            justifyContent: currentPage === 0 ? 'center' : 'flex-start', 
            alignItems: 'center',
            width: '100%',
            height: '100%',
            transition: 'justify-content 0.8s ease-in-out'
          }}>
            <HTMLFlipBook
              ref={flipBookRef}
              width={dimensions.width}
              height={dimensions.height}
              minWidth={200}
              maxWidth={2000}
              minHeight={150}
              maxHeight={2000}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              flippingTime={800}
              usePortrait={dimensions.isMobile}
              startPage={0}
              drawShadow={true}
              onFlip={onFlip}
              className="flipbook"
              style={{
                margin: '0 auto'
              }}
            >
              {displayImages.map((src, index) => {
                return (
                  <div key={index} className="page bg-white" style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt={`Page ${index + 1}`}
                      onLoad={() => handleImageLoad(index)}
                      onError={(e) => handleImageError(index)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        pointerEvents: 'none'
                      }}
                    />
                    {/* Center clickable area for Fancybox */}
                    <a
                      data-fancybox="gallery"
                      href={src}
                      data-caption={`Page ${index + 1} of ${displayImages.length}`}
                      onClick={handleCenterClick}
                      className="center-clickable-area"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50%',
                        height: '50%',
                        cursor: 'zoom-in',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      {/* Optional: Visual indicator (can be removed if not needed) */}
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          transition: 'background-color 0.2s ease',
                          pointerEvents: 'none'
                        }}
                        className="center-hover-indicator"
                      />
                    </a>
                  </div>
                );
              })}
            </HTMLFlipBook>
          </div>
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