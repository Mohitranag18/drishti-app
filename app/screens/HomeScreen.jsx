'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Moon,
  Users,
  Zap,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const HomeScreen = () => {
  const { setCurrentView } = useApp();
  const [selectedMood, setSelectedMood] = useState('');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const inspirationalCards = [
    {
      text: "Take a deep breath. You're doing your best today.",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      text: "Every small step forward is progress worth celebrating.",
      gradient: "from-indigo-400 to-purple-500"
    },
    {
      text: "You have the strength to overcome today's challenges.",
      gradient: "from-emerald-400 to-cyan-500"
    },
    {
      text: "Your feelings are valid and you deserve compassion.",
      gradient: "from-rose-400 to-pink-500"
    }
  ];

  const categories = [
    { 
      icon: Moon, 
      title: "Sleep & Rest", 
      color: "bg-indigo-50", 
      iconColor: "text-indigo-600", 
      hoverColor: "hover:bg-indigo-100" 
    },
    { 
      icon: Heart, 
      title: "Self-Care", 
      color: "bg-rose-50", 
      iconColor: "text-rose-500", 
      hoverColor: "hover:bg-rose-100" 
    },
    { 
      icon: Users, 
      title: "Social", 
      color: "bg-blue-50", 
      iconColor: "text-blue-600", 
      hoverColor: "hover:bg-blue-100" 
    },
    { 
      icon: Zap, 
      title: "Energy", 
      color: "bg-emerald-50", 
      iconColor: "text-emerald-600", 
      hoverColor: "hover:bg-emerald-100" 
    }
  ];

  const wellnessCards = [
    {
      title: "5-minute mindfulness meditation",
      description: "Center yourself with a quick guided session",
      color: "bg-gradient-to-br from-blue-50 to-indigo-100",
      accent: "bg-blue-600"
    },
    {
      title: "Connect with a supportive friend",
      description: "Reach out to someone who cares about you",
      color: "bg-gradient-to-br from-emerald-50 to-cyan-100",
      accent: "bg-emerald-600"
    },
    {
      title: "Gratitude journaling exercise", 
      description: "Reflect on three things you're grateful for",
      color: "bg-gradient-to-br from-purple-50 to-pink-100",
      accent: "bg-purple-600"
    }
  ];

  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => 
      prev === inspirationalCards.length - 1 ? 0 : prev + 1
    );
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => 
      prev === 0 ? inspirationalCards.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="px-4 sm:px-6 lg:px-8 pb-24 max-w-md mx-auto">
        
        {/* Header */}
        <motion.div 
          className="pt-12 pb-6"
          {...fadeInUp}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            How are you feeling today?
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Your wellbeing journey starts here
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {[
            { icon: Heart, label: 'Favorites' },
            { icon: Clock, label: 'History' },
            { icon: BookOpen, label: 'Journal' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              onClick={() => {
                if (action.label === 'Journal') {
                  setCurrentView('journal');
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all whitespace-nowrap shadow-sm"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <action.icon className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Inspirational Carousel */}
        <motion.div 
          className="relative mb-6 overflow-hidden rounded-2xl shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentCarouselIndex * 100}%)` }}
          >
            {inspirationalCards.map((card, index) => (
              <div
                key={index}
                className={`min-w-full h-40 sm:h-48 bg-gradient-to-br ${card.gradient} relative flex items-center justify-center p-6`}
              >
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 leading-relaxed max-w-xs">
                    {card.text}
                  </h3>
                </div>
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <motion.button
            onClick={prevCarousel}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </motion.button>
          <motion.button
            onClick={nextCarousel}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </motion.button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {inspirationalCards.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentCarouselIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentCarouselIndex ? 'bg-white w-6' : 'bg-white/60'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-16 h-16 ${category.color} ${category.hoverColor} rounded-2xl flex items-center justify-center mb-2 mx-auto transition-colors cursor-pointer shadow-sm`}>
                  <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                </div>
                <p className="text-gray-700 text-xs font-medium leading-tight">
                  {category.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Wellness Cards */}
        <motion.section 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">For You</h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {wellnessCards.map((card, index) => (
              <motion.div
                key={index}
                className={`${card.color} rounded-2xl p-4 border border-white shadow-sm`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-semibold text-sm mb-1">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3">
                      {card.description}
                    </p>
                    <motion.button 
                      className={`${card.accent} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Mood Check-in */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Quick Mood Check
          </h3>
          <div className="flex justify-center flex-wrap gap-3 mb-4">
            {['😊', '😐', '😔', '😟', '😴'].map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => setSelectedMood(emoji)}
                className={`text-2xl p-3 rounded-2xl transition-all ${
                  selectedMood === emoji 
                    ? 'bg-blue-100 scale-110 shadow-md' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                whileHover={{ scale: selectedMood === emoji ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
          {selectedMood && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-600 text-sm text-center"
            >
              Thanks for sharing! Let's explore activities that might help.
            </motion.p>
          )}
        </motion.div>

        {/* Daily Reflection */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Daily Reflection</h3>
          <p className="text-gray-600 text-sm mb-4">
            Take a moment to reflect on your day and find new perspectives
          </p>
          <div className="flex gap-3">
            <motion.button 
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Reflection
            </motion.button>
            <motion.button 
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Tips
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;