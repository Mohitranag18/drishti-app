'use client';

import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, onBackClick }) => {
  const { setCurrentView } = useApp();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      setCurrentView('home');
    }
  };

  return (
    <div className="flex justify-between items-center p-4 pt-8">
      {showBackButton ? (
        <button
          onClick={handleBackClick}
          className="p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      ) : (
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95">
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}
      
      <div className="text-white font-medium">
        Drishti
      </div>
      
      <div className="w-10 h-10" /> {/* Spacer for center alignment */}
    </div>
  );
};

export default Header;