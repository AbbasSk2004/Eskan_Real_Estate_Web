'use client';
import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ text = '', fullScreen = false }) => {
  const spinner = (
    <div className="d-flex flex-column align-items-center">
      <div 
        className="spinner-border text-primary" 
        role="status"
        style={{ width: '3rem', height: '3rem' }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && (
        <div className="mt-3 text-primary">
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  text: PropTypes.string,
  fullScreen: PropTypes.bool
};

// Property-specific loading component
export const PropertyLoadingCard = () => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div className="card border-0 shadow-sm">
      <div className="placeholder-glow">
        <div className="placeholder bg-light" style={{ height: '200px' }}></div>
      </div>
      <div className="card-body">
        <div className="placeholder-glow">
          <h5 className="placeholder bg-secondary w-75">
            <span className="visually-hidden">Loading heading</span>
          </h5>
          <p className="placeholder bg-light w-100"></p>
          <p className="placeholder bg-light w-50"></p>
          <div className="d-flex justify-content-between">
            <span className="placeholder bg-primary w-25"></span>
            <span className="placeholder bg-success w-25"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Search loading component
export const SearchLoadingState = () => (
  <div className="row">
    {[...Array(6)].map((_, index) => (
      <PropertyLoadingCard key={index} />
    ))}
  </div>
);

export default LoadingSpinner;