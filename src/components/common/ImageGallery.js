'use client';
import React, { useState } from 'react';
import Modal from './Modal';

const ImageGallery = ({ images, mainImage, alt = 'Property Image' }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allImages = mainImage ? [mainImage, ...images] : images;

  const openModal = (index) => {
    setSelectedImage(index);
    setIsModalOpen(true);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  if (!allImages || allImages.length === 0) {
    return (
      <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
        <i className="fa fa-image fa-3x text-muted"></i>
      </div>
    );
  }

  return (
    <>
      <div className="image-gallery">
        {/* Main Image */}
        <div className="main-image mb-3">
          <img
            src={allImages[0]}
            alt={alt}
            className="img-fluid rounded cursor-pointer"
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            onClick={() => openModal(0)}
          />
        </div>

        {/* Thumbnail Grid */}
        {allImages.length > 1 && (
          <div className="row g-2">
            {allImages.slice(1, 5).map((image, index) => (
              <div key={index} className="col-3">
                <div className="position-relative">
                  <img
                    src={image}
                    alt={`${alt} ${index + 2}`}
                    className="img-fluid rounded cursor-pointer"
                    style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                    onClick={() => openModal(index + 1)}
                  />
                  {index === 3 && allImages.length > 5 && (
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center rounded cursor-pointer"
                      onClick={() => openModal(4)}
                    >
                      <span className="text-white fw-bold">+{allImages.length - 4}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Gallery */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
        showCloseButton={false}
      >
        <div className="position-relative" onKeyDown={handleKeyDown} tabIndex={0}>
          <img
            src={allImages[selectedImage]}
            alt={`${alt} ${selectedImage + 1}`}
            className="img-fluid w-100"
            style={{ maxHeight: '80vh', objectFit: 'contain' }}
          />

          {/* Navigation Buttons */}
          {allImages.length > 1 && (
            <>
              <button
                className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-3"
                onClick={prevImage}
                style={{ zIndex: 10 }}
              >
                <i className="fa fa-chevron-left"></i>
              </button>
              <button
                className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-3"
                onClick={nextImage}
                style={{ zIndex: 10 }}
              >
                <i className="fa fa-chevron-right"></i>
              </button>
            </>
          )}

          {/* Close Button */}
          <button
            className="btn btn-dark position-absolute top-0 end-0 m-3"
            onClick={() => setIsModalOpen(false)}
            style={{ zIndex: 10 }}
          >
            <i className="fa fa-times"></i>
          </button>

          {/* Image Counter */}
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
            <span className="badge bg-dark bg-opacity-75">
              {selectedImage + 1} / {allImages.length}
            </span>
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="position-absolute bottom-0 start-0 w-100 p-3">
              <div className="d-flex justify-content-center gap-2 overflow-auto">
                {allImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`cursor-pointer rounded ${
                      index === selectedImage ? 'border border-primary border-3' : ''
                    }`}
                    style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ImageGallery;