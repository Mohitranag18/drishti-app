'use client';

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeScreen from './screens/HomeScreen';
import PerspectiveScreen from './screens/PerspectiveScreen';
import PerspectiveReviewScreen from './screens/PerspectiveReviewScreen';


const AppContent: React.FC = () => {
  const { state } = useApp();

  const getScreenTitle = () => {
    switch (state.currentView) {
      case 'home':
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
      case 'perspective1':
        if (state.perspectiveStage === 'input') {
          return "What's on your mind today?";
        } else if (state.perspectiveStage === 'understanding') {
          return "Let's Understand Your Story";
        } else if (state.perspectiveStage === 'solution') {
          return "New Ways to Look at It";
        }
        return "What's on your mind today?";
      case 'perspective2':
        return "What's on your mind today?";
      case 'journal':
        return "Journal";
      case 'profile':
        return "Profile";
      default:
        return 'Drishti';
    }
  };

  const getScreenSubtitle = () => {
    switch (state.currentView) {
      case 'perspective1':
        if (state.perspectiveStage === 'input') {
          return "Share what's bothering you, and I'll help you see it differently";
        } else if (state.perspectiveStage === 'understanding') {
          return "A few quick questions so our suggestions really fit your experience";
        } else if (state.perspectiveStage === 'solution') {
          return "These cards offer fresh, positive ways to move forward.";
        }
        return "Share what's bothering you, and I'll help you see it differently";
      case 'perspective2':
        return "Share what's bothering you, and I'll help you see it differently";
      case 'journal':
        return "Your personal reflection space";
      case 'profile':
        return "Your profile and settings";
      default:
        return null;
    }
  };

  const renderScreen = () => {
    switch (state.currentView) {
      case 'home':
        return <HomeScreen />;
      case 'perspective1':
        return <PerspectiveScreen />;
      case 'perspective2':
        return <PerspectiveReviewScreen />;
      case 'journal':
        return <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Journal</h3>
          <p className="text-pink-100 text-sm">Your personal reflection space - coming soon!</p>
        </div>;
      case 'profile':
        return <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Profile</h3>
          <p className="text-pink-100 text-sm">Your profile and settings - coming soon!</p>
        </div>;
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
      <div className="px-4 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 text-shadow">
            {getScreenTitle()}
          </h1>
          {getScreenSubtitle() && (
            <p className="text-pink-100 text-sm leading-relaxed">
              {getScreenSubtitle()}
            </p>
          )}
        </div>

        {renderScreen()}
      </div>

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