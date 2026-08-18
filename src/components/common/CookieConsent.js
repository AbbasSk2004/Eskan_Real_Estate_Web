'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-consent fixed-bottom bg-light p-3 shadow-lg">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-8 col-12 mb-2 mb-md-0">
            <p className="mb-0">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
              <Link href="/cookies" className="text-primary">Learn more</Link>
            </p>
          </div>
          <div className="col-md-4 col-12 text-md-end">
            <button
              className="btn btn-primary me-2"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={handleDecline}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 