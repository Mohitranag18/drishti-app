'use client';

import React from 'react';
import { Home, Edit3, User, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ViewType } from '../types';

const navigationItems = [
  { icon: Home, key: 'home' as ViewType, label: 'Home' },
  { icon: Edit3, key: 'perspective1' as ViewType, label: 'Perspective' },
  { icon: User, key: 'journal' as ViewType, label: 'Journal' },
  { icon: Settings, key: 'profile' as ViewType, label: 'Profile' }
];

const Navigation: React.FC = () => {
  const { state, setCurrentView } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-pink-400/80 backdrop-blur-sm border-t border-white/20">
      <div className="flex justify-around py-3 px-2">
        {navigationItems.map(({ icon: Icon, key, label }) => {
          const isActive = state.currentView === key;
          
          return (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-0 ${
                isActive 
                  ? 'bg-white/30 text-white scale-105' 
                  : 'text-pink-100 hover:text-white hover:bg-white/20 active:scale-95'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
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