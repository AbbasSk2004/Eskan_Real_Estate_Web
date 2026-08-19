'use client';

import React from 'react';
import PrivateRoute from '../../src/components/auth/PrivateRoute';
import AddPropertyForm from '../../src/components/properties/PropertyForm';

const AddPropertyPageContent = () => {
  // AddPropertyForm already provides its own `container-xxl > container`
  // wrapper. Nesting another one here compounded the container + card padding
  // and collapsed the form into a narrow column on mobile, so render it directly.
  return <AddPropertyForm />;
};

export default function AddPropertyPage() {
  return (
    <PrivateRoute>
      <AddPropertyPageContent />
    </PrivateRoute>
  );
}