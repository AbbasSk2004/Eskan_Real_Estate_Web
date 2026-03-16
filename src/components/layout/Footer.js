import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Module-level guard to prevent StrictMode duplicate initialization fetches
const checkedUsers = new Set();

const Footer = () => {
  const thanksRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const [hasSubmittedTestimonial, setHasSubmittedTestimonial] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkExistingTestimonial = async () => {
    if (!isAuthenticated || !user) {
      setHasSubmittedTestimonial(false);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate initialization check in StrictMode or across remounts
    if (checkedUsers.has(user.id)) {
      return;
    }
    checkedUsers.add(user.id);

    setIsLoading(true);
    try {
      const response = await endpoints.testimonials.checkUserTestimonial();
      if (response?.success) {
        setHasSubmittedTestimonial(response.exists);
      }
    } catch (err) {
      console.error('Error checking testimonial:', err);
      setHasSubmittedTestimonial(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkExistingTestimonial();
  }, [isAuthenticated, user]);

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please log in to submit your testimonial.');
      return;
    }

    // Check again if user has already submitted
    try {
      const checkResponse = await endpoints.testimonials.checkUserTestimonial();
      if (checkResponse?.exists) {
        toast.error('You have already submitted a testimonial.');
        setHasSubmittedTestimonial(true);
        return;
      }
    } catch (err) {
      console.error('Error checking testimonial status:', err);
    }

    const content = e.target.testimonialText.value.trim();
    const rating = parseInt(e.target.testimonialRating.value, 10);

    // Form validation
    if (!content) {
      toast.error('Please provide your testimonial text.');
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a valid rating between 1 and 5 stars.');
      return;
    }

    try {
      const response = await endpoints.testimonials.create({ 
        content, 
        rating
      });
      
      if (response?.success) {
        toast.success('Thank you for your feedback! Your testimonial has been submitted successfully.');
        setHasSubmittedTestimonial(true);
        e.target.reset();
      } else {
        throw new Error(response?.message || 'Failed to submit testimonial');
      }
    } catch (err) {
      let errorMessage = 'Failed to submit testimonial. Please try again.';
      
      if (err.message === 'Please log in to submit your testimonial.') {
        errorMessage = err.message;
      } else if (err.message === 'You have already submitted a testimonial.') {
        errorMessage = err.message;
        setHasSubmittedTestimonial(true);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error(errorMessage);
      console.error('Testimonial submission error:', err);
    }
  };

  const renderTestimonialSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="alert alert-info">
          <i className="fa fa-info-circle me-2"></i>
          Please <Link to="/login" className="text-primary">log in</Link> to submit a testimonial.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (hasSubmittedTestimonial) {
      return (
        <div className="alert alert-success">
          <i className="fa fa-check-circle me-2"></i>
          Thank you for your feedback! Your testimonial has been submitted and is pending review.
        </div>
      );
    }

    return (
      <form id="testimonialForm" className="rating-form-bg p-3 rounded" onSubmit={handleTestimonialSubmit}>
        <div className="mb-2">
          <textarea 
            className="form-control" 
            id="testimonialText" 
            name="testimonialText" 
            rows="2" 
            placeholder="Your thoughts..." 
            required
          ></textarea>
        </div>
        <div className="mb-2">
          <select 
            className="form-select" 
            id="testimonialRating" 
            name="testimonialRating" 
            required
          >
            <option value="">Rating</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆</option>
            <option value="3">★★★☆☆</option>
            <option value="2">★★☆☆☆</option>
            <option value="1">★☆☆☆☆</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100">Submit</button>
      </form>
    );
  };

  return (
    <footer
      className="container-fluid bg-dark text-white-50 footer pt-5 mt-5 wow fadeIn"
      data-wow-delay="0.1s"
    >
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-12 col-sm-6 col-lg-3 mb-4 mb-lg-0 text-center text-sm-start">
            <h5 className="text-white mb-4">Get In Touch</h5>
            <p className="mb-2"><i className="fa fa-map-marker-alt me-3"></i>Achrafieh, Charles Malek Avenue, Beirut, Lebanon</p>
            <p className="mb-2"><i className="fa fa-phone-alt me-3"></i>+961 1 234 567</p>
            <p className="mb-2"><i className="fa fa-envelope me-3"></i>info@eskan-lebanon.com</p>
            <div className="d-flex pt-2 justify-content-center justify-content-sm-start">
              <a className="btn btn-outline-light btn-social" href="/" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a className="btn btn-outline-light btn-social" href="/" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-outline-light btn-social" href="/" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              <a className="btn btn-outline-light btn-social" href="/" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 mb-4 mb-lg-0 text-center text-sm-start">
            <h5 className="text-white mb-4">Quick Links</h5>
            <Link to="/about" className="btn btn-link text-white-50">About Us</Link>
            <Link to="/contact" className="btn btn-link text-white-50">Contact Us</Link>
            <Link to="/properties" className="btn btn-link text-white-50">Our Properties</Link>
            <Link to="/privacy" className="btn btn-link text-white-50">Privacy Policy</Link>
            <Link to="/terms" className="btn btn-link text-white-50">Terms & Condition</Link>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 mb-4 mb-lg-0 text-center text-sm-start">
            <h5 className="text-white mb-4">Rate Us</h5>
            {renderTestimonialSection()}
          </div>
          <div className="col-12 col-sm-6 col-lg-3 mb-4 mb-lg-0 text-center text-sm-start">
            <h5 className="text-white mb-4">Contact Hours</h5>
            <p className="mb-2"><i className="fa fa-clock me-3"></i>Mon - Fri: 9am - 6pm</p>
            <p className="mb-2"><i className="fa fa-clock me-3"></i>Sat: 10am - 2pm</p>
            <p className="mb-2"><i className="fa fa-clock me-3"></i>Sun: Closed</p>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; <Link className="border-bottom" to="/">Eskan Lebanon</Link>, All Right Reserved.
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-menu">
                <Link to="/">Home</Link>
                <Link to="/cookies">Cookies</Link>
                <Link to="/help">Help</Link>
                <Link to="/contact#faqs">FAQs</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;