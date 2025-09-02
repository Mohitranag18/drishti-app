'use client';

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Header from './components/Header.jsx';
import Navigation from './components/Navigation.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import PerspectiveScreen from './screens/PerspectiveScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import NotificationsScreen from './screens/NotificationsScreen.jsx';
import JournalScreen from './screens/JournalScreen.jsx';

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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
} 