'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Dropdown from 'react-bootstrap/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useGlobalChat } from '../../context/ChatContext';
import NotificationBell from '../notifications/NotificationBell';
import toast from 'react-hot-toast';
import { useProfilePolling } from '../../hooks/useProfilePolling';
import Sidebar from './Sidebar';
import { getProfileImageUrl } from '../../utils/imageUtils';

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, isAuthenticated, logout, isInitializing } = useAuth();
  const { setShowChat, showChat } = useGlobalChat();
  const pathname = usePathname();
  const dropdownRef = useRef();

  // Use profile polling to get real-time profile data
  const { profileData, loading: profileLoading } = useProfilePolling();

  // Get user info from the profile data or fallback to auth user.
  // The auth user comes from the login payload (flat shape) or legacy
  // nested `profile` shape — check all of them.
  const firstName = profileData?.firstname || user?.firstname || user?.firstName || user?.profile?.firstname || user?.email?.split('@')[0] || 'User';
  const lastName = profileData?.lastname || user?.lastname || user?.lastName || user?.profile?.lastname || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profileData?.email || user?.email;
  // Multi-key avatar extraction: profile payload (URL string + object),
  // login payload (URL string + object), legacy nested shape, generic key.
  const avatarSource = [
    profileData?.profile_photo,
    profileData?.profilePhoto,
    user?.profile_photo,
    user?.profilePhoto,
    user?.profile?.profile_photo,
    user?.avatar
  ].find((value) => Boolean(value)) || null;
  const profileImg = getProfileImageUrl(avatarSource);
  // True only when the user actually has an uploaded photo — lets the loading
  // state take precedence over the default placeholder image.
  const hasRealProfilePhoto = Boolean(avatarSource);
  const isProfileLoading = isInitializing || profileLoading;

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 45);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        document.querySelectorAll('.profile-dropdown.show').forEach((el) => el.classList.remove('show'));
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open sidebar for mobile
  const handleSidebarOpen = () => setSidebarOpen(true);

  // Stable reference for closing the sidebar (passed down to Sidebar)
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

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

  const isActive = (path) =>
    pathname === path || (path !== '/' && pathname?.startsWith(`${path}/`));

  return (
    <div className={`container-fluid nav-bar bg-transparent ${isSticky ? 'sticky-top' : ''} ${showChat ? 'chat-open' : ''}`}>
      <nav className="navbar navbar-expand-lg bg-white navbar-light py-0 px-4">
        <Link href="/" className="navbar-brand d-flex align-items-center text-center">
          <div className="p-2 me-2">
            <img
              className="img-fluid"
              src="/Copilot_20250628_014309.png"
              alt="ESKAN logo"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
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
            <Link href="/" className={`nav-item nav-link text-dark ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link href="/about" className={`nav-item nav-link text-dark ${isActive('/about') ? 'active' : ''}`}>
              About
            </Link>
            <Link href="/properties" className={`nav-item nav-link text-dark ${isActive('/properties') ? 'active' : ''}`}>
              Properties
            </Link>
            <Link href="/contact" className={`nav-item nav-link text-dark ${isActive('/contact') ? 'active' : ''}`}>
              Contact
            </Link>
            {!isInitializing && isAuthenticated && (
              <Link href="/add-property" className={`nav-item nav-link text-dark ${isActive('/add-property') ? 'active' : ''}`}>
                Add Property
              </Link>
            )}
          </div>

          {/* Notification Bell and Profile Section */}
          <div className="d-flex align-items-center ms-2 ms-lg-3">
            {/* Notification Bell */}
            {!isInitializing && isAuthenticated && (
              <div className="me-3">
                <NotificationBell />
              </div>
            )}

            {/* Profile Dropdown or Join Us */}
            <div className="nav-item dropdown ms-2" ref={dropdownRef}>
              {isInitializing ? (
                <span className="d-inline-flex align-items-center px-3 py-2" aria-label="Loading authentication">
                  <span className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></span>
                  <span className="d-none d-lg-inline text-muted" style={{ fontSize: 14 }}>Loading...</span>
                </span>
              ) : isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle as="button" className="btn btn-link p-0 d-flex align-items-center gap-2" style={{ textDecoration: 'none', color: 'inherit', boxShadow: 'none' }} aria-label="Profile" disabled={isSigningOut}>
                    {hasRealProfilePhoto ? (
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
                    ) : isProfileLoading ? (
                      <span
                        className="spinner-border spinner-border-sm text-primary rounded-circle"
                        role="status"
                        aria-label="Loading profile"
                        style={{
                          width: 36,
                          height: 36,
                          borderWidth: 3,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isSigningOut ? 0.5 : 1
                        }}
                      ></span>
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
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end mt-2" style={{ minWidth: 240 }}>
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
                            border: '2px solid #ccc'
                          }}
                        />
                      ) : (
                        <i className="fa fa-user-circle fa-4x text-primary mb-2"></i>
                      )}
                      <div className="fw-bold">{fullName}</div>
                      <small className="text-muted">{email}</small>
                    </div>
                    <div className="dropdown-divider"></div>

                    <Dropdown.Item onClick={() => setShowChat(true)}>
                      <i className="fa fa-envelope me-2"></i>Direct Messages
                    </Dropdown.Item>

                    <Dropdown.Item as={Link} href="/profile">
                      <i className="fa fa-user-edit me-2"></i>Manage Profile
                    </Dropdown.Item>

                    <div className="dropdown-divider"></div>

                    <Dropdown.Item className="text-danger" onClick={handleSignOut} disabled={isSigningOut}>
                      {isSigningOut ? (
                        <>
                          <i className="fa fa-spinner fa-spin me-2"></i>Signing Out...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-sign-out-alt me-2"></i>Sign Out
                        </>
                      )}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Dropdown>
                  <Dropdown.Toggle as="button" className="btn btn-primary px-3">
                    <i className="fa fa-user me-2"></i>Join us
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="rounded-0 m-0">
                    <Dropdown.Item as={Link} href="/login">Login</Dropdown.Item>
                    <Dropdown.Item as={Link} href="/register">Register</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onChatOpen={() => setShowChat(true)}
        variant="mobile"
      />
    </div>
  );
};

export default Navbar;