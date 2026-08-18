'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

import authService from '../../services/auth';
import '../../assets/css/LoginForm.css';

const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      const { email, password } = formData;
      await login(email, password, formData.rememberMe);

      // Get redirect path from localStorage (set by PrivateRoute) or default to home
      let from = '/';
      if (typeof window !== 'undefined') {
        from = window.localStorage.getItem('auth_redirect') || '/';
        window.localStorage.removeItem('auth_redirect');
      }
      router.replace(from);
    } catch (err) {
      // Prefer the message returned by the backend (e.g. "Invalid credentials")
      const serverMessage = err?.response?.data?.message;

      // Fallbacks: Axios message or a generic one
      const errorMessage = serverMessage || err.message || 'Failed to login. Please try again.';

      console.error('Login error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="text-center mb-4">
        <h2 className="mb-2 text-primary">Welcome Back!</h2>
        <p className="text-muted">Sign in to access your real estate account</p>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 mb-3">
              <div className="form-floating">
                <input 
                  type="email" 
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  id="email" 
                  name="email"
                  placeholder="Your Email" 
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  autoComplete="email"
                />
                <label htmlFor="email">Email Address</label>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="form-floating">
                <input 
                  type="password" 
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  id="password" 
                  name="password"
                  placeholder="Your Password" 
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  autoComplete="current-password"
                  minLength="6"
                />
                <label htmlFor="password">Password</label>
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Keep me signed in
                </label>
              </div>
              <Link 
                href="/forgot-password" 
                className={`text-primary fw-bold text-decoration-none ${isSubmitting ? 'disabled' : ''}`}
              >
                Forgot Password?
              </Link>
            </div>

            <div className="col-12 mb-4">
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 fw-bold text-uppercase" 
                disabled={isSubmitting}
                style={{ letterSpacing: '0.5px' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In Securely'
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="mb-0">
                Don't have an account?{' '}
                <Link href="/register" className={`text-primary fw-bold ${isSubmitting ? 'disabled' : ''}`}>
                  Create an Account
                </Link>
              </p>
            </div>
          </div>
        </form>
    </>
  );
};

export default LoginForm;