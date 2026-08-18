'use client';
import React, { useState } from 'react';
import { submitContactForm } from '../../services/contact.service';

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferred_contact: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await submitContactForm(formData);

      if (response.data.success) {
        alert(response.data.message);
        setFormData(prev => ({
          ...prev,
          message: '',
          name: '',
          email: '',
          phone: ''
        }));
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form bg-white p-4 rounded shadow-sm">
      <div className="row g-3">
        <div className="col-md-6">
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your Phone"
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <select
            name="preferred_contact"
            id="preferred_contact"
            value={formData.preferred_contact}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="" disabled>Preferred Contact Method</option>
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div className="col-12">
          <textarea
            name="message"
            id="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            required
            className="form-control"
            rows={4}
          />
        </div>

        <div className="col-12">
          <button 
            type="submit" 
            className="btn btn-primary w-100 py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : 'Send Message'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;