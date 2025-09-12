'use client';

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';
import Navigation from './components/Navigation.jsx';
import HomeScreen from './home/page.jsx';
import PerspectiveScreen from './perspective/page.jsx';
import ProfileScreen from './profile/page.jsx';
import NotificationsScreen from './notification/page.jsx';
import JournalScreen from './journal/page.jsx';
import HistoryScreen from './history/page.jsx';

const AppContent = () => {
  const { state } = useApp();

  const renderScreen = () => {
    switch (state.currentView) {
      case 'home':
        return <HomeScreen />;
      case 'perspective':
        return <PerspectiveScreen />;
      case 'notifications':
        return <NotificationsScreen />
      case 'profile':
        return <ProfileScreen />
      case 'journal':
        return <JournalScreen />
      case 'history':
        return <HistoryScreen />
      default:
        return <HomeScreen />;
    }
  };

  const showBackButton = state.currentView !== 'home';

  return (
    <div className="min-h-screen relative">
      <Header 
        showBackButton={showBackButton}
        onBackClick={() => {
          // Add custom back navigation logic here if needed
        }}
      />

      {/* Main Content */}
      {renderScreen()}

      <Navigation />
    </div>
  );
};

export default function Home() {
  return (
    <ProtectedRoute>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ProtectedRoute>
  );
}
