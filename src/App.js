import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider, useGlobalChat } from './context/ChatContext';
import { GoogleMapsProvider } from './components/shared/GoogleMapsLoader';
import toast from 'react-hot-toast';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import CustomToastContainer from './components/common/ToastContainer';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/auth/PrivateRoute';

import websocketService from './services/websocket';
import { HelmetProvider } from 'react-helmet-async';


// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NotificationManager from './components/notifications/NotificationManager';
import CookieConsent from './components/common/CookieConsent';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './components/properties/PropertyDetail';
import AddProperty from './pages/AddProperty';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Chat from './components/chat/Chat';

import PropertyAgent from './pages/PropertyAgent';
import CookiePage from './pages/CookiePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookieSettings from './pages/CookieSettings';
import Help from './pages/Help';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PropertyTypePage from './pages/PropertyTypePage';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import VerifyOTPPage from './pages/VerifyOTP';

// Styles
import './App.css';

// AppContent component that uses authentication context
const AppContent = () => {
  const [isInitializing, setIsInitializing] = useState(() => {
    // Don't show initializing state if we have a valid token
    return !(typeof window !== 'undefined' && sessionStorage.getItem('access_token'));
  });
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();
  const { showChat, setShowChat } = useGlobalChat();
 

  // Ensure page scrolls to top on app initialization and refresh
  useEffect(() => {
    const handlePageLoad = () => {
      window.scrollTo(0, 0);
    };
    
    // Initial scroll to top
    handlePageLoad();
    
    // Add event listener for page loads/refreshes
    window.addEventListener('load', handlePageLoad);
    
    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, []);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (user) {
      // Connect to WebSocket server
      websocketService.connect();
      
      // Cleanup on unmount
      return () => {
        websocketService.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
      // Simulate initialization tasks (e.g., checking DB connection, loading config)
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error('Failed to initialize the application.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [user]);


  // Don't show loading spinner if we have a valid user
  if (isInitializing && !user) {
    return <LoadingSpinner fullScreen text="loading..." />;
  }

  if (hasError && !user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Connection Error</h4>
          <p>Failed to connect to the database. Please check your environment setup and try again.</p>
          <hr />
          <p className="mb-0">
            Need help? Check the README.md file or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`App ${showChat ? 'chat-open' : ''}`}>
      <ToastContainer />
      <CustomToastContainer />
      <Navbar onChatOpen={() => setShowChat(true)} />
      <NotificationManager />
      
      <main className="main-content">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/type/:type" element={<PropertyTypePage />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cookies" element={<CookiePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/help" element={<Help />} />
          <Route path="/property-agent" element={<PropertyAgent />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/category/:category" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />

          <Route element={<PrivateRoute />}>
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings/cookies" element={<CookieSettings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Chat />

      <BackToTop />
      <Footer />
      <CookieConsent />
    </div>
  );
};

// Main App component that provides context
function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AuthProvider>
           
              
                <NotificationProvider>
                  <ChatProvider>
                    <GoogleMapsProvider>
                      <AppContent />
                    </GoogleMapsProvider>
                  </ChatProvider>
                </NotificationProvider>
              
          
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
