'use client';

import React from 'react';
import Link from 'next/link';

const CallToAction = () => {
  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="bg-light rounded p-2 p-sm-3">
          <div className="bg-white rounded p-3 p-sm-4" style={{ border: '1px dashed rgba(0, 185, 142, .3)' }}>
            <div className="row g-4 g-lg-5 align-items-center">
              <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                <img loading="eager" className="img-fluid rounded w-100" src="/img/call-to-action.jpg" alt="Real estate consultation" />
              </div>
              <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                <div className="mb-4">
                  <h1 className="mb-3" style={{ fontSize: 'calc(1.5rem + 1vw)' }}>Contact With Our Team</h1>
                  <p>Get in touch with our real estate experts to find your dream property. We're here to help you every step of the way.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Link href="/contact" className="btn btn-primary py-2 py-md-3 px-3 px-md-4">Get Started</Link>
                  <Link href="/about" className="btn btn-dark py-2 py-md-3 px-3 px-md-4">Learn More</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;