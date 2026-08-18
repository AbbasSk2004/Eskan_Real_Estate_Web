'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { PropertyInquiryService } from '../../services/property_inquiry';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const PropertyInquiryForm = ({ propertyId }) => {
  const { user } = useAuth();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    preferred_contact: 'email'
  });

  // Check if user was redirected from login
  useEffect(() => {
    const from = searchParams.get('from');
    const isRedirectedFromLogin = from && from === pathname;

    if (user && isRedirectedFromLogin) {
      // Clear the query param to avoid reopening on future navigations
      router.replace(pathname);
    }
  }, [user, pathname, router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to send an inquiry');
      return;
    }

    try {
      setLoading(true);
      
      const inquiryData = {
        ...formData,
        property_id: propertyId
      };

      await PropertyInquiryService.createInquiry(inquiryData);
      
      toast.success('Your inquiry has been sent successfully!');
      setFormData({ subject: '', message: '', preferred_contact: 'email' });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error(error.message || 'Failed to send inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // If no user is logged in, this component shouldn't be visible due to parent's conditional rendering
  if (!user) {
    return (
      <div className="text-center py-3">
        <p className="mb-0">Please sign in to send an inquiry</p>
      </div>
    );
  }

  return (
    <div className="property-inquiry-form">
      <h3>Send Inquiry</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Enter subject..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="form-control"
            rows="4"
            required
            placeholder="I'm interested in this property..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="preferred_contact">Preferred Contact Method</label>
          <select
            id="preferred_contact"
            name="preferred_contact"
            value={formData.preferred_contact}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Inquiry'}
        </button>
      </form>
    </div>
  );
};

export default PropertyInquiryForm;
