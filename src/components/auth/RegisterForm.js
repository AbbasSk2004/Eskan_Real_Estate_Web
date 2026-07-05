import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import { useToast } from '../../hooks/useToast';
import '../../assets/css/RegisterForm.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for phone field to only allow numbers and + symbol
    if (name === 'phone') {
      // Only allow digits and + symbol at the beginning
      const phoneRegex = /^[+]?\d*$/;
      if (value === '' || phoneRegex.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Validate Lebanese phone number format
      // Accept formats like: 76123456, 03123456, +96176123456, +9613123456, 87766666, +96187766666
      const lebanesePhoneRegex = /^(\+961|0)?(3|7[0-9]|8[0-9])\d{6}$/;
      if (!lebanesePhoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid Lebanese phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Capitalize first letter of first name and last name
      const capitalizedFirstName = formData.firstname.trim().charAt(0).toUpperCase() + formData.firstname.trim().slice(1);
      const capitalizedLastName = formData.lastname.trim().charAt(0).toUpperCase() + formData.lastname.trim().slice(1);
      
      // Register the user
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: capitalizedFirstName,
        lastName: capitalizedLastName,
        phone: formData.phone
      });

      if (response.success) {
        toast.success('Registration successful! Please verify your email.');
        // Redirect to OTP verification page with email
        navigate('/verify-otp', { 
          state: { email: formData.email },
          replace: true 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        setErrors({
          submit: error.response.data.message || 'Invalid registration data'
        });
      } else if (error.response?.status === 409) {
        setErrors({
          submit: 'An account with this email already exists'
        });
      } else {
        setErrors({
          submit: error.message || 'Registration failed. Please try again.'
        });
      }
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="form-header text-center">
        <h2>Create Account</h2>
        <p className="text-muted">Join our real estate community</p>
      </div>

      {errors.submit && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="fa fa-exclamation-triangle me-2"></i>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstname">First Name *</label>
            <div className="input-with-icon">
              <i className="fa fa-user"></i>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Enter your first name"
                className={errors.firstname ? 'error' : ''}
              />
            </div>
            {errors.firstname && <span className="error-message">{errors.firstname}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name *</label>
            <div className="input-with-icon">
              <i className="fa fa-user"></i>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Enter your last name"
                className={errors.lastname ? 'error' : ''}
              />
            </div>
            {errors.lastname && <span className="error-message">{errors.lastname}</span>}
          </div>
        </div>

        <div className="form-stack">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div className="input-with-icon">
              <i className="fa fa-envelope"></i>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <div className="input-with-icon">
              <i className="fa fa-phone"></i>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="76123456 or +96176123456"
                className={errors.phone ? 'error' : ''}
              />
            </div>
            {errors.phone && <span className="error-message">{errors.phone}</span>}
            <small className="form-text text-muted">
              Enter a valid Lebanese number (e.g., 76123456 or +96176123456)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="input-with-icon">
              <i className="fa fa-lock"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              <i 
                className={`toggle-password-icon fa fa-eye${showPassword ? '-slash' : ''}`}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              ></i>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="input-with-icon">
              <i className="fa fa-lock"></i>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              <i 
                className={`toggle-password-icon fa fa-eye${showConfirmPassword ? '-slash' : ''}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              ></i>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="form-group terms-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className={errors.agreeToTerms ? 'error' : ''}
            />
            <span>I agree to the </span>
            <Link to="/terms" className="text-primary">Terms & Conditions</Link>
            <span> and </span>
            <Link to="/privacy" className="text-primary">Privacy Policy</Link>
          </label>
          {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="login-link">
          <p>
            Already have an account? <Link to="/login" className="text-primary">Login here</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;