'use client';

import React, { useState, useEffect } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import './PropertyGalleryStyles.css';

const ImageModal = ({ images, currentIndex, title, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyPress);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('gallery-open');
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('gallery-open');
    };
  }, [activeIndex]);

  const goToNext = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const goToPrevious = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToImage = (index) => setActiveIndex(index);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content bg-transparent border-0">
          <div className="modal-header border-0 position-absolute w-100 z-3">
            <h5 className="modal-title text-white">{title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body d-flex align-items-center justify-content-center p-0">
            <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center">
              <img
                src={images[activeIndex]}
                alt={`${title} ${activeIndex + 1}`}
                className="img-fluid"
                style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }}
                loading="eager"
              />
              <button
                className="btn btn-light rounded-circle p-2 position-absolute start-0 top-50 translate-middle-y ms-3"
                onClick={goToPrevious}
              >
                <i className="fa fa-chevron-left"></i>
              </button>
              <button
                className="btn btn-light rounded-circle p-2 position-absolute end-0 top-50 translate-middle-y me-3"
                onClick={goToNext}
              >
                <i className="fa fa-chevron-right"></i>
              </button>
              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                <span className="badge bg-dark bg-opacity-75 fs-6">
                  {activeIndex + 1} / {images.length}
                </span>
              </div>
            </div>
          </div>
          <div className="position-absolute bottom-0 w-100 p-3 z-3">
            <div className="d-flex justify-content-center gap-2 overflow-auto">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={`img-thumbnail ${index === activeIndex ? 'border-primary border-3' : ''}`}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  loading="eager"
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyImageGallery = ({ mainImage, images = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const allImages = [mainImage, ...images].filter(Boolean);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  return (
    <>
      <div className="property-gallery">
        {/* Main Image - 50% width */}
        <div
          className="main-image-wrapper"
          onClick={() => handleImageClick(0)}
        >
          <img
            src={allImages[0]}
            alt="Main"
            className="img-fluid"
            loading="eager"
          />
          <div className="position-absolute top-0 end-0 m-3">
            <span className="badge bg-dark bg-opacity-75 px-3 py-2">
              <i className="fas fa-camera me-2"></i>
              {allImages.length} Photos
            </span>
          </div>
        </div>

        {/* Thumbnails - 50% width, 2x2 grid */}
        <div className="thumbnails-grid">
          {allImages.slice(1, 5).map((img, index) => (
            <div
              key={index}
              className="thumbnail-wrapper"
              onClick={() => handleImageClick(index + 1)}
            >
              <img
                src={img}
                alt={`Thumb ${index + 1}`}
                className="img-fluid"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <ImageModal
          images={allImages}
          currentIndex={selectedImageIndex}
          title="Property Images"
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default PropertyImageGallery;
