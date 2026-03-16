import React, { useState, useEffect } from 'react';
import { endpoints } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { getProfileImageUrl } from '../../utils/imageUtils';
import { useProfilePolling } from '../../hooks/useProfilePolling';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
  const toast = useToast();
  const { updateUserState } = useAuth();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    bio: '',
    profile_photo: null
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Use profile polling to get latest data
  const { profileData, loading: profileLoading, refreshProfile } = useProfilePolling();

  // Update form data when profile data changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstname: profileData.firstname || '',
        lastname: profileData.lastname || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        bio: profileData.bio || ''
      });

      // Set preview URL from profile photo
      if (profileData.profile_photo) {
        // Handle both string URLs and object format for backward compatibility
        if (typeof profileData.profile_photo === 'object' && profileData.profile_photo.url) {
          setPreviewUrl(profileData.profile_photo.url);
        } else if (profileData.profile_photo.startsWith('http')) {
          setPreviewUrl(profileData.profile_photo);
        } else {
          setPreviewUrl(getProfileImageUrl(profileData.profile_photo));
        }
      }
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profile_photo: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add all text fields, even if empty
      Object.keys(formData).forEach(key => {
        if (key !== 'profile_photo') {
          submitData.append(key, formData[key] || '');
        }
      });
      
      // Add profile photo if it exists and is a File
      if (formData.profile_photo instanceof File) {
        submitData.append('profile_photo', formData.profile_photo);
      }

      const response = await endpoints.profile.update(submitData);
      
      if (response?.data?.success) {
        const updatedProfile = response.data.data;
        toast.success('Profile updated successfully!');
        if (updateUserState) {
          updateUserState(updatedProfile);
        }
        if (refreshProfile) {
          refreshProfile();
        }
      } else {
        throw new Error(response?.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="bg-light rounded p-4">
      <div className="text-center mb-4">
        <h2 className="mb-3">Update Your Profile</h2>
        <p className="text-muted">Keep your information up to date</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Profile Photo */}
        <div className="row mb-4">
          <div className="col-12 text-center">
            <div className="mb-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/user-placeholder.jpg';
                  }}
                />
              ) : (
                <div 
                  className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center"
                  style={{ width: '120px', height: '120px' }}
                >
                  <i className="fa fa-user fa-3x text-white"></i>
                </div>
              )}
            </div>
            <div className="mb-3">
              <input
                type="file"
                id="profile_photo"
                name="profile_photo"
                className="form-control"
                accept="image/jpeg,image/png,image/gif"
                onChange={handlePhotoChange}
              />
              <small className="text-muted d-block mt-1">Maximum file size: 5MB</small>
              <small className="text-muted d-block">Accepted formats: JPEG, PNG, GIF</small>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                placeholder="First Name"
                required
              />
              <label htmlFor="firstname">First Name</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
              />
              <label htmlFor="lastname">Last Name</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                disabled
              />
              <label htmlFor="email">Email (Cannot be changed)</label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
              />
              <label htmlFor="phone">Phone Number</label>
            </div>
          </div>
          <div className="col-12">
            <div className="form-floating">
              <textarea
                className="form-control"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Bio"
                style={{ height: '120px' }}
              ></textarea>
              <label htmlFor="bio">Bio</label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-4">
          <button
            type="submit"
            className="btn btn-primary py-3 px-5"
            disabled={loading || profileLoading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Updating...
              </>
            ) : (
              <>
                <i className="fa fa-save me-2"></i>
                Update Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;