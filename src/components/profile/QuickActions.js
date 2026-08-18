'use client';
import React from 'react';
import Link from 'next/link';

const QuickActions = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Quick Actions</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 mb-3">
            <Link href="/add-property" className="btn btn-primary w-100">
              <i className="fa fa-plus me-2"></i>
              Add New Property
            </Link>
          </div>
          <div className="col-md-4 mb-3">
            <Link href="/properties" className="btn btn-outline-primary w-100">
              <i className="fa fa-search me-2"></i>
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;