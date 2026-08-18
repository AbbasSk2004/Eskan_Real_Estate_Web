'use client';
import React, { useState, useEffect } from 'react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    // Ensure we're at the top on page load/refresh
    window.scrollTo(0, 0);
    
    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility);
    
    // Add load event listener for refreshes
    window.addEventListener('load', () => {
      window.scrollTo(0, 0);
      setIsVisible(false);
    });
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('load', () => {
        window.scrollTo(0, 0);
        setIsVisible(false);
      });
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 me-4 mb-4 shadow-lg d-flex align-items-center justify-content-center"
          style={{ width: '45px', height: '45px', zIndex: 1000 }}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default BackToTop;
