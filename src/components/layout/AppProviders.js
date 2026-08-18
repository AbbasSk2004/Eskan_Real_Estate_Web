'use client';

import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { ChatProvider } from '../../context/ChatContext';
import CustomToastContainer from '../common/ToastContainer';
import NotificationManager from '../notifications/NotificationManager';
import Chat from '../chat/Chat';
import BackToTop from '../common/BackToTop';
import CookieConsent from '../common/CookieConsent';
import ErrorBoundary from '../common/ErrorBoundary';

export default function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <CustomToastContainer />
            <NotificationManager />
            <Chat />
            <BackToTop />
            <CookieConsent />
            {children}
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}