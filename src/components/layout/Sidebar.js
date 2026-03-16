import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationBell from '../notifications/NotificationBell';
import NotificationItem from '../notifications/NotificationItem';
import { getProfileImageUrl } from '../../utils/imageUtils';

const Sidebar = ({ 
  isOpen = false, 
  onClose = () => {}, 
  variant = 'mobile', // 'mobile', 'admin', 'user'
  className = '',
  onChatOpen = () => {}
}) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { startFetching, unreadCount } = useNotification();

  // Use realtime notifications hook (WebSocket + polling)
  const {
    notifications,
    loading: notifLoading,
    error: notifError,
    fetchNotifications: manualFetch,
    markAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications({ pollInterval: 10000 });

  // Local state to control notification panel visibility
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Close sidebar ONLY when the route actually changes (mobile variant)
  // We purposely watch only the pathname so opening the sidebar itself will not immediately close it.
  useEffect(() => {
    if (variant === 'mobile') {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose is stable from parent via useCallback
  }, [location.pathname]);

  // Close sidebar when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        variant === 'mobile' &&
        !notificationModalOpen &&
        !event.target.closest('.sidebar')
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, variant, onClose, notificationModalOpen]);

  // Close notification panel when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationModalOpen &&
        variant === 'mobile' &&
        !event.target.closest('.notification-panel') &&
        !event.target.closest('.notification-btn')
      ) {
        setNotificationModalOpen(false);
      }
    };

    if (notificationModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationModalOpen, variant]);

  const handleSignOut = () => {
    logout();
    onClose();
  };

  // Navigation items in the requested order
  const getNavigationItems = () => {
    if (isAuthenticated) {
      return [
        { label: 'Home', path: '/', icon: 'fa-home' },
        { label: 'Manage Profile', path: '/profile', icon: 'fa-user-edit' },
        { label: 'Property List', path: '/properties', icon: 'fa-building' },
        { label: 'Direct Messages', path: '/messages', icon: 'fa-envelope' },
        { label: 'Agent', path: '/property-agent', icon: 'fa-user-tie' },
        { label: 'Add Property', path: '/add-property', icon: 'fa-plus-circle' },
        { label: 'About', path: '/about', icon: 'fa-info-circle' },
        { label: 'Contact', path: '/contact', icon: 'fa-envelope' }
      ];
    }

    return [
      { label: 'Home', path: '/', icon: 'fa-home' },
      { label: 'Property List', path: '/properties', icon: 'fa-building' },
      { label: 'Agent', path: '/property-agent', icon: 'fa-user-tie' },
      { label: 'About', path: '/about', icon: 'fa-info-circle' },
      { label: 'Contact', path: '/contact', icon: 'fa-envelope' }
    ];
  };

  const navigationItems = getNavigationItems();

  // Sidebar classes
  const sidebarClasses = `
    sidebar 
    ${variant === 'mobile' ? 'sidebar-mobile' : 'sidebar-desktop'} 
    ${isOpen ? 'sidebar-open' : 'sidebar-closed'}
    ${className}
  `.trim();

  // Handle clear all notifications
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }
    try {
      await clearAllNotifications();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  return (
    <>
      {/* Overlay */}
      {variant === 'mobile' && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040
          }}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        width: '300px',
        height: '100vh',
        backgroundColor: '#fff',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 1050,
        transition: 'transform 0.3s ease',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="sidebar-header p-4 border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="icon p-2 me-2">
                <img 
                  className="img-fluid" 
                  src="/img/icon-deal.png" 
                  alt="Icon" 
                  style={{ width: '30px', height: '30px' }} 
                />
              </div>
              <h5 className="m-0 text-primary">ESKAN</h5>
            </div>
            {variant === 'mobile' && (
              <button 
                className="btn btn-link text-dark p-0"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <i className="fa fa-times fa-lg"></i>
              </button>
            )}
          </div>
        </div>

        {/* User Info with notification bell */}
        {isAuthenticated && currentUser && (
          <div className="sidebar-user p-4 bg-light border-bottom">
            <div className="d-flex align-items-start justify-content-between">
              <div className="d-flex align-items-center">
                {currentUser.profile?.profile_photo ? (
                  <img
                    src={getProfileImageUrl(currentUser.profile.profile_photo)}
                    alt="Profile"
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                    style={{ width: '50px', height: '50px' }}
                  >
                    <i className="fa fa-user text-white"></i>
                  </div>
                )}
                <div>
                  <h6 className="mb-0">
                    {`${currentUser.profile?.firstname || currentUser.email?.split('@')[0] || 'User'} ${currentUser.profile?.lastname || ''}`.trim()}
                  </h6>
                  <small className="text-muted d-block">
                    {currentUser.profile?.email || currentUser.email}
                  </small>
                </div>
              </div>
              {/* Notification bell (show only on non-mobile variants) */}
              {variant !== 'mobile' && (
                <div className="ms-2">
                  <NotificationBell />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav p-3 flex-grow-1">
          <ul className="nav flex-column">
            {/* Mobile notifications entry */}
            {variant === 'mobile' && isAuthenticated && (
              <li className="nav-item mb-2">
                <button
                  type="button"
                  className="nav-link d-flex align-items-center py-2 px-3 text-secondary bg-transparent border-0 w-100 text-start notification-btn"
                  style={{
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setNotificationModalOpen(true);
                    manualFetch();
                    onClose(); // Close the sidebar when opening notifications
                  }}
                >
                  <i className="fa fa-bell me-3"></i>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="badge bg-danger ms-2 rounded-pill">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </li>
            )}
            {navigationItems.map((item, index) => (
              <li
                key={index}
                className="nav-item mb-2 d-flex align-items-center justify-content-between"
              >
                {item.label === 'Direct Messages' ? (
                  <button
                    type="button"
                    className="nav-link d-flex align-items-center py-2 px-3 text-secondary bg-transparent border-0 w-100 text-start"
                    style={{
                      borderRadius: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      onClose();
                      onChatOpen();
                    }}
                  >
                    <i className={`fa ${item.icon} me-3`}></i>
                    {item.label}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      nav-link d-flex align-items-center py-2 px-3
                      ${isActive ? 'active bg-primary-soft text-primary' : 'text-secondary'}
                    `}
                    style={({ isActive }) => ({
                      borderRadius: '8px',
                      transition: 'all 0.2s ease'
                    })}
                    onClick={onClose}
                  >
                    <i className={`fa ${item.icon} me-3`}></i>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer p-3 border-top mt-auto">
          {isAuthenticated ? (
            <button
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
              onClick={handleSignOut}
              style={{ borderRadius: '8px' }}
            >
              <i className="fa fa-sign-out-alt me-2"></i>
              Sign Out
            </button>
          ) : (
            <div className="d-grid gap-2">
              <NavLink 
                to="/login" 
                className="btn btn-primary d-flex align-items-center justify-content-center"
                style={{ borderRadius: '8px' }}
              >
                <i className="fa fa-sign-in-alt me-2"></i>
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                style={{ borderRadius: '8px' }}
              >
                <i className="fa fa-user-plus me-2"></i>
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Notification Overlay */}
      {variant === 'mobile' && notificationModalOpen && (
        <div 
          className="notification-overlay"
          onClick={() => setNotificationModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1060
          }}
        />
      )}

      {/* Mobile slide-in notification panel */}
      {variant === 'mobile' && (
        <div 
          className="notification-panel"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '300px',
            height: '100vh',
            backgroundColor: '#fff',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
            zIndex: 1070,
            transition: 'transform 0.3s ease',
            transform: notificationModalOpen ? 'translateX(0)' : 'translateX(100%)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Panel Header */}
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
            <h6 className="m-0 fw-bold mb-0">Notifications</h6>
            <div className="d-flex align-items-center gap-2">
              {notifications.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              )}
              <button 
                className="btn btn-link text-dark p-0"
                onClick={() => setNotificationModalOpen(false)}
                aria-label="Close notifications"
              >
                <i className="fa fa-times fa-lg"></i>
              </button>
            </div>
          </div>

          {/* Notification content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notifLoading && (
              <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            )}
            {notifError && (
              <div className="text-center p-3 text-danger small">
                <i className="fa fa-exclamation-circle me-2"></i>
                {notifError}
              </div>
            )}
            {!notifLoading && notifications.length === 0 && (
              <div className="text-center text-muted p-4">
                <i className="fa fa-bell-slash fa-2x mb-2" />
                <p className="mb-0">No notifications yet</p>
              </div>
            )}
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
                allowClick={false}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;