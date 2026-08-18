'use client';

import React, { useState } from 'react';
import PrivateRoute from '../../src/components/auth/PrivateRoute';
import ProfileHeader from '../../src/components/profile/ProfileHeader';
import ProfileTabs from '../../src/components/profile/ProfileTabs';
import OverviewTab from '../../src/components/profile/OverviewTab';
import PropertiesTab from '../../src/components/profile/PropertiesTab';
import FavoritesTab from '../../src/components/profile/FavoritesTab';
import ChangePassword from '../../src/components/profile/change_password';

const ProfilePageContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'properties':
        return <PropertiesTab />;
      case 'favorites':
        return <FavoritesTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="container-fluid py-5">
      <div className="container">
        <ProfileHeader
          updateUserState={(user) => user}
          onChangePassword={() => setShowPasswordModal(true)}
        />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-4">{renderTabContent()}</div>
      </div>

      <ChangePassword
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default function ProfilePage() {
  return (
    <PrivateRoute>
      <ProfilePageContent />
    </PrivateRoute>
  );
}