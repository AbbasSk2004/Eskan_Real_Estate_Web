'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../hooks/useToast';
import authService from '../../services/auth';
import '../../assets/css/RegisterForm.css';

const VerifyOTP = () => {
  const router = useRouter();
  const toast = useToast();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from query params (set by the register page)
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const codeParam = params.get('code');

    if (emailParam) {
      setEmail(emailParam);
      // Dev email mode: the register endpoint echoes the OTP as "code"
      // (never sent in production) — prefill it for a one-click verify.
      if (codeParam && /^\d{6}$/.test(codeParam)) {
        setOtp(codeParam);
      }
    } else {
      // No email provided, redirect to register
      toast.error('Email not provided. Please register again.');
      router.push('/register');
    }
  }, [router, toast]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, canResend]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.verifyOTP(email, otp);
      
      if (response.success) {
        toast.success('Email verified successfully!');
        
        // Email verified successfully, redirect user to login page to sign in
        router.replace('/login');
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      const response = await authService.resendOTP(email);
      
      if (response.success) {
        toast.success('Verification code resent to your email');
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(response.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="form-header text-center">
        <h2>Verify Your Email</h2>
        <p className="text-muted">Enter the verification code sent to {email}</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="fa fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-stack">
          <div className="form-group">
            <label htmlFor="otp">Verification Code</label>
            <div className="input-with-icon">
              <i className="fa fa-key"></i>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code"
                className={error ? 'error' : ''}
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        <div className="resend-link text-center mt-3">
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              className={`text-primary btn btn-link p-0 ${!canResend ? 'disabled' : ''}`}
              onClick={handleResendOtp}
              disabled={!canResend || loading}
            >
              {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default VerifyOTP;