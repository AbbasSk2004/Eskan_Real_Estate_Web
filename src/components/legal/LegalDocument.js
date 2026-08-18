'use client';
import React, { useState } from 'react';
import TermsAndConditions from './TermsAndConditions';
import PrivacyPolicy from './PrivacyPolicy';
import CookiePolicy from './CookiePolicy';

const LegalDocument = ({ type = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(type);

  const documents = {
    terms: {
      title: 'Terms and Conditions',
      component: <TermsAndConditions />,
      icon: 'fa-file-contract'
    },
    privacy: {
      title: 'Privacy Policy',
      component: <PrivacyPolicy />,
      icon: 'fa-shield-alt'
    },
    cookies: {
      title: 'Cookie Policy',
      component: <CookiePolicy />,
      icon: 'fa-cookie-bite'
    }
  };

  const currentDocument = documents[activeTab];

  return (
    <div className="container-fluid py-5">
      <div className="container">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-lg-3 mb-4">
            <div className="bg-light rounded p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="text-primary mb-4">
                <i className="fa fa-gavel me-2"></i>
                Legal Documents
              </h5>
              <nav className="nav flex-column">
                {Object.entries(documents).map(([key, doc]) => (
                  <button
                    key={key}
                    className={`nav-link text-start border-0 bg-transparent p-3 rounded mb-2 ${
                      activeTab === key ? 'bg-primary text-white' : 'text-dark hover-bg-light'
                    }`}
                    onClick={() => setActiveTab(key)}
                    style={{
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <i className={`fa ${doc.icon} me-2`}></i>
                    {doc.title}
                  </button>
                ))}
              </nav>
              
              {/* Quick Links */}
              <div className="mt-4 pt-4 border-top">
                <h6 className="text-muted mb-3">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => window.print()}
                  >
                    <i className="fa fa-print me-2"></i>
                    Print Document
                  </button>
                  <a 
                    href={`/legal/${activeTab}.pdf`}
                    className="btn btn-outline-secondary btn-sm"
                    download
                  >
                    <i className="fa fa-download me-2"></i>
                    Download PDF
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="col-lg-9">
            <div className="bg-white rounded shadow-sm p-5">
              {/* Document Header */}
              <div className="border-bottom pb-4 mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h1 className="text-primary mb-2">
                      <i className={`fa ${currentDocument.icon} me-3`}></i>
                      {currentDocument.title}
                    </h1>
                    <p className="text-muted mb-0">
                      Effective Date: January 1, 2024 | Last Updated: January 15, 2024
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="btn-group" role="group">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => window.print()}
                        title="Print Document"
                      >
                        <i className="fa fa-print"></i>
                      </button>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }}
                        title="Share Link"
                      >
                        <i className="fa fa-share"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="legal-content" style={{ lineHeight: '1.8' }}>
                {currentDocument.component}
              </div>

              {/* Document Footer */}
              <div className="border-top pt-4 mt-5">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <p className="text-muted mb-0">
                      <i className="fa fa-info-circle me-2"></i>
                      If you have any questions about this document, please{' '}
                      <a href="/contact" className="text-primary">contact us</a>.
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <small className="text-muted">
                      Document Version: 2.1
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocument;