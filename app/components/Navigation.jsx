'use client';

import React from 'react';
import { Home, Edit3, Bell, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const navigationItems = [
  { icon: Home, key: 'home', label: 'Home' },
  { icon: Edit3, key: 'perspective', label: 'Perspective' },
  { icon: Bell, key: 'notifications', label: 'Notifications' },
  { icon: Settings, key: 'profile', label: 'Profile' }
];

const Navigation = () => {
  const { state, setCurrentView } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-500 backdrop-blur-sm border-t border-white/20">
      <div className="flex justify-around py-3 px-2">
        {navigationItems.map(({ icon: Icon, key, label }) => {
          const isActive = state.currentView === key;
          
          return (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`flex flex-col items-center p-2 rounded-full transition-all duration-200 min-w-0 ${
                isActive 
                  ? 'bg-white/30 text-white scale-105' 
                  : 'text-pink-100 hover:text-white hover:bg-white/20 active:scale-95'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-pink-400/80" />
    </div>
  );
};

export default Navigation; 