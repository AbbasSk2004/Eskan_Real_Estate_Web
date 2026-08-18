'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useToast } from '../../hooks/useToast';
import api from '../../services/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const ChangePassword = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { logout } = useAuth();
  const router = useRouter();

  // Reset the form every time the modal opens
  useEffect(() => {
    if (show) {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/profile/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.data?.success) {
        toast.success('Password changed successfully! You will be logged out for security reasons.');
        onHide();

        // Log the user out immediately (logout handles token clearing and navigation)
        try {
          await logout();
        } catch (logoutError) {
          console.error('Logout error after password change:', logoutError);
          // Force navigation to login even if logout API call fails
          router.push('/login');
        }
      } else {
        throw new Error(response.data?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to change password. Please try again.');
      
      // Handle specific errors
      if (error.response?.data?.field) {
        setErrors({
          ...errors,
          [error.response.data.field]: error.response.data.message
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label htmlFor="currentPassword">Current Password</Form.Label>
            <Form.Control
              type="password"
              className={`${errors.currentPassword ? 'is-invalid' : ''}`}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.currentPassword && (
              <div className="invalid-feedback">{errors.currentPassword}</div>
            )}
          </div>

          <div className="mb-3">
            <Form.Label htmlFor="newPassword">New Password</Form.Label>
            <Form.Control
              type="password"
              className={`${errors.newPassword ? 'is-invalid' : ''}`}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.newPassword && (
              <div className="invalid-feedback">{errors.newPassword}</div>
            )}
            <Form.Text className="text-muted">
              Password must be at least 8 characters long
            </Form.Text>
          </div>

          <div className="mb-3">
            <Form.Label htmlFor="confirmPassword">Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              className={`${errors.confirmPassword ? 'is-invalid' : ''}`}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword}</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ChangePassword;
