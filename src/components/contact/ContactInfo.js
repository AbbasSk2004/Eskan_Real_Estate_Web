'use client';
import React from 'react';

const ContactInfo = ({ 
  showTitle = true,
  className = '',
  variant = 'default' // 'default', 'compact', 'card'
}) => {
  const contactDetails = {
    phone: '+961 1 234 567',
    email: 'info@eskanrealestate.com',
    address: 'Beirut Central District, Lebanon',
    workingHours: {
      weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
      weekend: 'Saturday: 10:00 AM - 4:00 PM',
      sunday: 'Sunday: Closed'
    },
    socialMedia: {
      facebook: 'https://facebook.com/eskanrealestate',
      instagram: 'https://instagram.com/eskanrealestate',
      linkedin: 'https://linkedin.com/company/eskanrealestate',
      twitter: 'https://twitter.com/eskanrealestate'
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`contact-info-compact ${className}`}>
        <div className="d-flex flex-wrap gap-3">
          <a href={`tel:${contactDetails.phone}`} className="text-decoration-none">
            <i className="fa fa-phone text-primary me-1"></i>
            {contactDetails.phone}
          </a>
          <a href={`mailto:${contactDetails.email}`} className="text-decoration-none">
            <i className="fa fa-envelope text-primary me-1"></i>
            {contactDetails.email}
          </a>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`contact-info-card ${className}`}>
        <div className="bg-light rounded p-4">
          {showTitle && (
            <h4 className="text-primary mb-4">
              <i className="fa fa-address-book me-2"></i>
              Contact Information
            </h4>
          )}

          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '40px', height: '40px' }}>
                  <i className="fa fa-phone text-white"></i>
                </div>
                <div>
                  <h6 className="mb-0">Phone</h6>
                  <a href={`tel:${contactDetails.phone}`} className="text-decoration-none">
                    {contactDetails.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '40px', height: '40px' }}>
                  <i className="fa fa-envelope text-white"></i>
                </div>
                <div>
                  <h6 className="mb-0">Email</h6>
                  <a href={`mailto:${contactDetails.email}`} className="text-decoration-none">
                    {contactDetails.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '40px', height: '40px' }}>
                  <i className="fa fa-map-marker-alt text-white"></i>
                </div>
                <div>
                  <h6 className="mb-0">Address</h6>
                  <p className="text-muted mb-0">{contactDetails.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`contact-info ${className}`}>
      <div className="bg-light rounded p-4">
        {showTitle && (
          <h4 className="text-primary mb-4">
            <i className="fa fa-address-book me-2"></i>
            Get In Touch
          </h4>
        )}

        <div className="row g-4">
          {/* Phone */}
          <div className="col-md-6">
            <div className="contact-item">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '50px', height: '50px' }}>
                  <i className="fa fa-phone text-white fa-lg"></i>
                </div>
                <div>
                  <h5 className="mb-0">Call Us</h5>
                  <a href={`tel:${contactDetails.phone}`} className="text-decoration-none text-primary">
                    {contactDetails.phone}
                  </a>
                </div>
              </div>
              <p className="text-muted small mb-0">
                Available during business hours for immediate assistance
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="col-md-6">
            <div className="contact-item">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '50px', height: '50px' }}>
                  <i className="fa fa-envelope text-white fa-lg"></i>
                </div>
                <div>
                  <h5 className="mb-0">Email Us</h5>
                  <a href={`mailto:${contactDetails.email}`} className="text-decoration-none text-primary">
                    {contactDetails.email}
                  </a>
                </div>
              </div>
              <p className="text-muted small mb-0">
                Send us an email and we'll respond within 24 hours
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="col-md-6">
            <div className="contact-item">
              <div className="d-flex align-items-start mb-2">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '50px', height: '50px' }}>
                  <i className="fa fa-map-marker-alt text-white fa-lg"></i>
                </div>
                <div>
                  <h5 className="mb-0">Visit Us</h5>
                  <p className="text-muted mb-0">{contactDetails.address}</p>
                </div>
              </div>
              <p className="text-muted small mb-0">
                Come visit our office for personalized service
              </p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="col-md-6">
            <div className="contact-item">
              <div className="d-flex align-items-start mb-2">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: '50px', height: '50px' }}>
                  <i className="fa fa-clock text-white fa-lg"></i>
                </div>
                <div>
                  <h5 className="mb-0">Working Hours</h5>
                  <div className="text-muted small">
                    <div>{contactDetails.workingHours.weekdays}</div>
                    <div>{contactDetails.workingHours.weekend}</div>
                    <div>{contactDetails.workingHours.sunday}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-4 pt-4 border-top">
          <h6 className="mb-3">Follow Us</h6>
          <div className="d-flex gap-3">
            <a 
              href={contactDetails.socialMedia.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm"
              title="Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a 
              href={contactDetails.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm"
              title="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a 
              href={contactDetails.socialMedia.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm"
              title="LinkedIn"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a 
              href={contactDetails.socialMedia.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm"
              title="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-4 pt-3 border-top">
          <div className="alert alert-info mb-0">
            <i className="fa fa-info-circle me-2"></i>
            <strong>Emergency Contact:</strong> For urgent property matters outside business hours, 
            call <a href="tel:+96170123456" className="text-decoration-none">+961 70 123 456</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
