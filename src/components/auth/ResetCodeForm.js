'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '../../services/auth';
import { useToast } from '../../hooks/useToast';
import '../../assets/css/RegisterForm.css';

const ResetCodeForm = () => {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [missingSession, setMissingSession] = useState(false);

  // Read the email saved by the forgot-password page exactly once per mount.
  // No toast calls here and only stable deps, so this can never re-fire into
  // a render loop.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const emailFromSession = sessionStorage.getItem('resetEmail');
    if (emailFromSession) {
      setEmail(emailFromSession);
      return;
    }
    setMissingSession(true);
    router.replace('/forgot-password');
  }, [router]);

  if (missingSession) {
    return null;
  }

  const handleContinue = (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit verification code from your email');
      return;
    }

    setError('');
    // Hand the code to the next step; the backend validates it on reset.
    sessionStorage.setItem('resetCode', otp);
    router.push('/set-new-password');
  };

  const handleResend = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        toast.success('A new verification code has been sent to your email');
      } else {
        toast.error(response.message || 'Failed to send verification code');
      }
    } catch (resendError) {
      console.error('Resend code error:', resendError);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="form-header text-center">
        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
             style={{ width: '80px', height: '80px' }}>
          <i className="fa fa-key fa-2x text-white"></i>
        </div>
        <h2>Enter Verification Code</h2>
        <p className="text-muted">We sent a 6-digit code to {email}</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="fa fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleContinue} className="registration-form">
        <div className="form-group mb-4">
          <label htmlFor="otp">Verification Code *</label>
          <div className="input-with-icon">
            <i className="fa fa-key"></i>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className={error && !otp ? 'error' : ''}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
        </div>

        <div className="mt-1 mb-4">
          <button
            type="button"
            className="btn btn-link p-0 text-primary"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? 'Sending...' : "Didn't receive the code? Resend Code"}
          </button>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          Continue
        </button>

        <div className="login-link text-center mt-3">
          <p>
            <Link href="/forgot-password" className="text-primary">Start over</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetCodeForm;