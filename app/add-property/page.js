'use client';

import React from 'react';
import PrivateRoute from '../../src/components/auth/PrivateRoute';
import AddPropertyForm from '../../src/components/properties/PropertyForm';

const AddPropertyPageContent = () => {
  return (
    <div className="container-xxl py-5">
      <div className="container">
        <AddPropertyForm />
      </div>
    </div>
  );
};

export default function AddPropertyPage() {
  return (
    <PrivateRoute>
      <AddPropertyPageContent />
    </PrivateRoute>
  );
}