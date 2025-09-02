'use client';

import React from 'react';
import { motion } from 'framer-motion';

const defaultMoods = ['😊', '😐', '😔', '😟'];

const MoodSelector = ({ 
  selectedMood, 
  onMoodSelect, 
  moods = defaultMoods 
}) => {
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {moods.map((emoji, index) => (
        <motion.button
          key={emoji}
          onClick={() => onMoodSelect(emoji)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
            selectedMood === emoji 
              ? 'bg-white/40 scale-110 shadow-lg' 
              : 'hover:bg-white/20 active:scale-95'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
};

export default MoodSelector; 