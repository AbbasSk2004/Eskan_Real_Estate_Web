'use client';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        success: {
          style: {
            background: '#28a745',
          },
        },
        error: {
          style: {
            background: '#dc3545',
          },
          duration: 5000,
        },
        loading: {
          style: {
            background: '#00B98E',
          },
        },
      }}
    />
  );
};

export default ToastContainer; 