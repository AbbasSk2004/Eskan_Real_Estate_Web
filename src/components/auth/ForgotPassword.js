'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '../../services/auth';
import { useToast } from '../../hooks/useToast';

const ForgotPassword = () => {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Custom styles
  const formStyles = {
    maxWidth: '100%',
    width: '100%'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        // Store email to pass to reset page
        sessionStorage.setItem('resetEmail', email);
      } else {
        setError(response.message || 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to send verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
             style={{ width: '80px', height: '80px' }}>
          <i className="fa fa-check fa-2x text-white"></i>
        </div>
        <h2 className="text-primary mb-3">Check Your Email</h2>
        <p className="text-muted mb-4" style={{ whiteSpace: 'normal' }}>
          We've sent a verification code to:
          <br />
          <strong>{email}</strong>
        </p>
        <p className="text-muted mb-4" style={{ whiteSpace: 'normal' }}>
          Enter the verification code on the next screen to reset your password.
          If you don't see the email, check your spam folder.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <button
            className="btn btn-primary"
            onClick={() => router.push('/reset-password')}
          >
            <i className="fa fa-arrow-right me-2"></i>
            Continue to Reset Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-4">
        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
             style={{ width: '80px', height: '80px' }}>
          <i className="fa fa-key fa-2x text-white"></i>
        </div>
        <h2 className="text-primary fw-bold mb-2">Forgot Password?</h2>
        <p className="text-muted fs-6 mb-0" style={{ whiteSpace: 'normal' }}>
          No worries! Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fa fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={formStyles}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label text-muted mb-1">Email Address</label>
          <div className="input-group">
            <span className="input-group-text bg-transparent text-muted border-end-0">
              <i className="fa fa-envelope"></i>
            </span>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control border-start-0 ${error ? 'is-invalid' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>
        </div>

        <div className="d-grid gap-2 mb-3">
          <button
            type="submit"
            className="btn btn-primary py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending Verification Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-primary">
            <i className="fa fa-arrow-left me-2"></i>
            Back to Login
          </Link>
        </div>
      </form>
    </>
  );
};

export default ForgotPassword;