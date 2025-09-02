'use client';

import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const Header = ({ showBackButton = false, onBackClick }) => {
  const { setCurrentView } = useApp();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      setCurrentView('home');
    }
  };

  return (
    <></>
  );
};

export default Header; 