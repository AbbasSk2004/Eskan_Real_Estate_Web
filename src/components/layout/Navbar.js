import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import toast from 'react-hot-toast';
import { useProfilePolling } from '../../hooks/useProfilePolling';
import Sidebar from './Sidebar';
import { getProfileImageUrl } from '../../utils/imageUtils';

const Navbar = ({ onChatOpen }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Use profile polling to get real-time profile data
  const { profileData } = useProfilePolling();

  // Get user info from the profile data or fallback to auth user
  const firstName = profileData?.firstname || user?.profile?.firstname || user?.email?.split('@')[0] || 'User';
  const lastName = profileData?.lastname || user?.profile?.lastname || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profileData?.email || user?.email;
  const profileImg = getProfileImageUrl(profileData?.profile_photo || user?.profile?.profile_photo);

  // Close sidebar & profile dropdown on route change
  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 45);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  // Open sidebar for mobile
  const handleSidebarOpen = () => setSidebarOpen(true);

  // Stable reference for closing the sidebar (passed down to Sidebar)
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

  // Toggle profile dropdown
  const handleProfileDropdown = () => setProfileDropdownOpen((prev) => !prev);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await logout();

      // Force a full reload to the login page so all state is cleared
      window.location.replace('/login');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className={`container-fluid nav-bar bg-transparent ${isSticky ? 'sticky-top' : ''}`}>
      <nav className="navbar navbar-expand-lg bg-white navbar-light py-0 px-4">
        <Link to="/" className="navbar-brand d-flex align-items-center text-center">
          <div className="p-2 me-2">
            <img 
              className="img-fluid" 
              src={process.env.PUBLIC_URL + '/Copilot_20250628_014309.png'} 
              alt="Logo" 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                objectFit: 'cover'
              }} 
              loading="eager"
            />
          </div>
          <h1 className="m-0 text-primary">ESKAN</h1>
        </Link>
        {/* Hamburger for mobile to open sidebar */}
        <button
          type="button"
          className="navbar-toggler"
          aria-label="Open sidebar"
          onClick={handleSidebarOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav links visible only on lg and up */}
        <div className="collapse navbar-collapse d-none d-lg-flex">
          <div className="navbar-nav ms-auto">
            <NavLink to="/" end className="nav-item nav-link text-dark">
              Home
            </NavLink>
            <NavLink to="/about" className="nav-item nav-link text-dark">
              About
            </NavLink>
            <div className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link text-dark"
                data-bs-toggle="dropdown"
                type="button"
                style={{ textDecoration: 'none', color: 'inherit', boxShadow: 'none' }}
              >
                Property
              </button>
              <div className="dropdown-menu rounded-0 m-0">
                <Link to="/properties" className="dropdown-item">Property List</Link>
                <Link to="/property-agent" className="dropdown-item">Property Agent</Link>
              </div>
            </div>
            <NavLink to="/contact" className="nav-item nav-link text-dark">
              Contact
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/add-property" className="nav-item nav-link text-dark">
                Add Property
              </NavLink>
            )}
          </div>
          
          {/* Notification Bell and Profile Section */}
          <div className="d-flex align-items-center ms-2 ms-lg-3">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="me-3">
                <NotificationBell />
              </div>
            )}

            {/* Profile Dropdown or Join Us */}
            <div className="nav-item dropdown ms-2" ref={dropdownRef}>
              {isAuthenticated ? (
                <>
                  <button
                    className="btn btn-link p-0 d-flex align-items-center gap-2"
                    type="button"
                    onClick={handleProfileDropdown}
                    style={{ textDecoration: 'none', color: 'inherit', boxShadow: 'none' }}
                    aria-label="Profile"
                    disabled={isSigningOut}
                  >
                    {profileImg ? (
                      <img
                        src={profileImg}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ 
                          width: 36, 
                          height: 36, 
                          objectFit: 'cover', 
                          border: '2px solid #ccc',
                          opacity: isSigningOut ? 0.5 : 1,
                          transition: 'opacity 0.2s ease'
                        }}
                      />
                    ) : (
                      <i className="fa fa-user-circle fa-2x text-primary" style={{ 
                        opacity: isSigningOut ? 0.5 : 1,
                        transition: 'opacity 0.2s ease'
                      }}></i>
                    )}
                    <span className="ms-2 d-none d-lg-inline text-dark" style={{ 
                      fontSize: 14, 
                      fontWeight: 500,
                      opacity: isSigningOut ? 0.5 : 1,
                      transition: 'opacity 0.2s ease'
                    }}>
                      {fullName}
                    </span>
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="dropdown-menu dropdown-menu-end show mt-2" style={{ minWidth: 240, right: 0, left: 'auto' }}>
                      <div className="text-center p-3">
                        {profileImg ? (
                          <img
                            src={profileImg}
                            alt="Profile"
                            className="rounded-circle mb-2"
                            style={{ 
                              width: 64, 
                              height: 64, 
                              objectFit: 'cover', 
                              border: '2px solid #ccc',
                              transition: 'opacity 0.2s ease'
                            }}
                          />
                        ) : (
                          <i className="fa fa-user-circle fa-4x text-primary mb-2"></i>
                        )}
                        <div className="fw-bold">{fullName}</div>
                        <small className="text-muted">{email}</small>
                      </div>
                      <div className="dropdown-divider"></div>
                      
                      <button 
                        className="dropdown-item" 
                        onClick={() => {
                          onChatOpen();
                          setProfileDropdownOpen(false);
                        }}
                        type="button"
                      >
                        <i className="fa fa-envelope me-2"></i>Direct Messages
                      </button>
                   
                      <Link to="/profile" className="dropdown-item">
                        <i className="fa fa-user-edit me-2"></i>Manage Profile
                      </Link>
                      
                      <div className="dropdown-divider"></div>
                      
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleSignOut}
                        type="button"
                        disabled={isSigningOut}
                      >
                        {isSigningOut ? (
                          <>
                            <i className="fa fa-spinner fa-spin me-2"></i>Signing Out...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-sign-out-alt me-2"></i>Sign Out
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="btn btn-primary px-3 dropdown-toggle w-100 w-lg-auto"
                    data-bs-toggle="dropdown"
                    type="button"
                  >
                    <i className="fa fa-user me-2"></i>Join us
                  </button>
                  <div className="dropdown-menu rounded-0 m-0">
                    <Link to="/login" className="dropdown-item">Login</Link>
                    <Link to="/register" className="dropdown-item">Register</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onChatOpen={onChatOpen}
        variant="mobile"
      />
    </div>
  );
};

export default Navbar;