import React, { useState, useEffect } from 'react';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';
import FAQ from '../components/common/FAQ';
import { faqService } from '../services/faqService';

const Contact = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await faqService.getAllFaqs();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setError('Failed to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const handleContactSuccess = (data) => {
    console.log('Contact form submitted successfully:', data);
  };

  const renderFaqSection = () => {
    if (loading) {
      return (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger text-center" role="alert">
          {error}
          <button 
            className="btn btn-link"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!faqs || faqs.length === 0) {
      return (
        <div className="text-center text-muted">
          <p>No FAQs available at the moment.</p>
        </div>
      );
    }

    return (
      <FAQ 
        faqs={faqs} 
        searchable={true}
        categoryFilter={true}
      />
    );
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="container-fluid py-5 bg-primary text-white">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
              <p className="lead mb-0">
                Get in touch with our real estate experts. We're here to help you 
                find your perfect property or answer any questions you may have.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Contact Form */}
          <div className="col-lg-7">
            <div className="mb-4">
              <h2 className="text-primary">Send Us a Message</h2>
              <p className="text-muted">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>
            <ContactForm onSuccess={handleContactSuccess} />
          </div>

          {/* Contact Information */}
          <div className="col-lg-5">
            <ContactInfo variant="card" />
          </div>
        </div>
      </div>



      {/* FAQ Section */}
      <div className="container py-5" id="faqs">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h2 className="text-primary mb-4">Frequently Asked Questions</h2>
            <p className="text-muted mb-5">
              Find answers to common questions about our real estate services
            </p>
          </div>
          <div className="col-lg-10">
            {renderFaqSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;