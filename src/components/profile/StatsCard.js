'use client';
import React from 'react';

const StatsCard = ({ icon, iconColor, count, label }) => {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className={`rounded-circle bg-light p-3 me-3`}>
            <i className={`fas ${icon} ${iconColor} fa-lg`}></i>
          </div>
          <div>
            <h3 className="mb-0">{count}</h3>
            <p className="text-muted mb-0">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;