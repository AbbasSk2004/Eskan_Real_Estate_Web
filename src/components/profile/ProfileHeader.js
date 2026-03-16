import React, { useState, useEffect, useRef } from 'react';
import { endpoints } from '../../services/api';
import { getProfileImageUrl } from '../../utils/imageUtils';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { useProfilePolling } from '../../hooks/useProfilePolling';

const ProfileHeader = ({ onChangePassword, updateUserState }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    profilePhoto: null
  });
  const toast = useToast();
  const navigate = useNavigate();
  
  // Use the profile polling hook to get latest data
  const { profileData, loading: profileLoading, refreshProfile } = useProfilePolling();
  const prevEditModeRef = useRef(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstname', formData.firstname || '');
      formDataToSend.append('lastname', formData.lastname || '');
      formDataToSend.append('phone', formData.phone || '');
      
      if (formData.profilePhoto instanceof File) {
        formDataToSend.append('profile_photo', formData.profilePhoto);
      }

      const response = await endpoints.profile.update(formDataToSend);
      
      if (response?.data?.success) {
        const updatedProfile = response.data.data;
        setEditMode(false);
        toast.success('Profile updated successfully!');

        // Update profile state immediately (avoid stale cached values)
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
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
      setEditMode(false);
    }
  };

  // Initialize edit form when edit mode is opened (only once per open)
  useEffect(() => {
    if (editMode && !prevEditModeRef.current && profileData) {
      setFormData({
        firstname: profileData.firstname || '',
        lastname: profileData.lastname || '',
        phone: profileData.phone || '',
        profilePhoto: null
      });
    }
    prevEditModeRef.current = editMode;
  }, [editMode, profileData]);

  if (!profileData) {
    return <div>Loading profile...</div>;
  }

  const {
    firstname = '',
    lastname = '',
    email = '',
    phone = '',
    profile_photo = '',
    role = 'user',
    status = 'active',
    is_featured = false
  } = profileData;

  return (
    <div className="row mb-5">
      <div className="col-12">
        <div className="bg-light rounded p-4">
          <div className="row align-items-center">
            <div className="col-md-3 text-center">
              <div className="position-relative d-inline-block">
                {profile_photo ? (
                  <img
                    src={getProfileImageUrl(profile_photo)}
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
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <i className="fa fa-user fa-3x text-white"></i>
                  </div>
                )}
                {role === 'agent' && (
                  <span className="position-absolute bottom-0 end-0 badge bg-success">
                    Agent
                  </span>
                )}
              </div>
            </div>
            <div className="col-md-6">
              {!editMode ? (
                <>
                  <h3 className="mb-2">
                    {firstname} {lastname}
                    {is_featured && (
                      <span className="badge bg-warning ms-2">Featured</span>
                    )}
                  </h3>
                  <p className="text-muted mb-1">
                    <i className="fa fa-envelope me-2"></i>
                    {email}
                  </p>
                  <p className="text-muted mb-1">
                    <i className="fa fa-phone me-2"></i>
                    {phone || 'No phone number'}
                  </p>
                  <p className="text-muted mb-0">
                    <i className="fa fa-user-tag me-2"></i>
                    Role: {role.charAt(0).toUpperCase() + role.slice(1)}
                  </p>
                  <p className="text-muted mb-0">
                    <i className="fa fa-circle me-2"></i>
                    Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                </>
              ) : (
                <form onSubmit={handleProfileUpdate}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        value={formData.firstname}
                        onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        value={formData.lastname}
                        onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, profilePhoto: e.target.files[0]})}
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary me-2">Save Changes</button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
            <div className="col-md-3 text-end">
              {!editMode && (
                <>
                  <button 
                    className="btn btn-outline-primary me-2"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="fa fa-edit me-2"></i>
                    Edit Profile
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={onChangePassword}
                  >
                    <i className="fa fa-key me-2"></i>
                    Change Password
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;