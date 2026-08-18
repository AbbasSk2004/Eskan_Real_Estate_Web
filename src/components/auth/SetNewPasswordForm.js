'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '../../services/auth';
import { useToast } from '../../hooks/useToast';
import '../../assets/css/RegisterForm.css';

const SetNewPasswordForm = () => {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [missingSession, setMissingSession] = useState(false);

  // Restore email + code saved by the earlier steps exactly once per mount.
  // Stable deps only and no toast calls here — cannot re-fire into a loop.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const emailFromSession = sessionStorage.getItem('resetEmail');
    const otpFromSession = sessionStorage.getItem('resetCode');
    if (emailFromSession && otpFromSession) {
      setEmail(emailFromSession);
      setOtp(otpFromSession);
      return;
    }
    setMissingSession(true);
    router.replace('/forgot-password');
  }, [router]);

  if (missingSession) {
    return null;
  }

  const validateForm = () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Verification code is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.resetPassword(email, otp, password);

      if (response.success) {
        // Clear the stored session data
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetCode');
        toast.success('Password has been reset successfully! Please login with your new password.');
        router.replace('/login');
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (submitError) {
      console.error('Password reset error:', submitError);
      setError(
        submitError.response?.data?.message ||
        'Failed to reset password. The verification code may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="form-header text-center">
        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
             style={{ width: '80px', height: '80px' }}>
          <i className="fa fa-lock fa-2x text-white"></i>
        </div>
        <h2>Set New Password</h2>
        <p className="text-muted">Choose a new password for {email}</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="fa fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="mb-4">
          <label htmlFor="password" className="form-label text-muted mb-1">New Password *</label>
          <div className="input-group">
            <span className="input-group-text bg-transparent text-muted border-end-0">
              <i className="fa fa-lock"></i>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              className={`form-control border-start-0 ${error && !password ? 'is-invalid' : ''}`}
            />
            <i
              className={`toggle-password-icon fa fa-eye${showPassword ? '-slash' : ''}`}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            ></i>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label text-muted mb-1">Confirm New Password *</label>
          <div className="input-group">
            <span className="input-group-text bg-transparent text-muted border-end-0">
              <i className="fa fa-lock"></i>
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className={`form-control border-start-0 ${error && password !== confirmPassword ? 'is-invalid' : ''}`}
            />
            <i
              className={`toggle-password-icon fa fa-eye${showConfirmPassword ? '-slash' : ''}`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            ></i>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </div>

        <div className="login-link text-center mt-3">
          <p>
            <Link href="/forgot-password" className="text-primary">Request a new code</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SetNewPasswordForm;