'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy, CheckCircle, Edit, Trash2, BookOpen, Home, Share2, Settings } from 'lucide-react';

const JournalScreen = () => {
  const [entries, setEntries] = useState([
    {
      date: "Wed, Sept 2",
      emoji: "😟",
      summary: "Stayed calm in coding class despite stress",
      tags: ["🌱 Growth", "⚡ Action"],
      points: 3,
      done: false,
    },
    {
      date: "Tue, Sept 1",
      emoji: "🙂",
      summary: "Had a peaceful walk and practiced gratitude",
      tags: ["💛 Kindness", "🌱 Growth"],
      points: 2,
      done: true,
    },
    {
      date: "Mon, Aug 31",
      emoji: "😃",
      summary: "Finished project milestone on time!",
      tags: ["⚡ Action", "🎉 Win"],
      points: 5,
      done: true,
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <div className="px-4 sm:px-6 lg:px-8 pb-24 max-w-md mx-auto w-full">
        
        {/* Header */}
        <motion.div 
          className="pt-12 pb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            My Journal
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            A safe space for your reflections 🌱
          </p>
        </motion.div>

        {/* Progress / Points */}
        <motion.div
          className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-gray-900 font-semibold text-sm">Total Points</p>
              <p className="text-gray-600 text-xs">You’ve earned 120 pts 🎉</p>
            </div>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            7-day streak 🔥
          </div>
        </motion.div>

        {/* Entries List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {entries.map((entry, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{entry.emoji}</span>
                  <span className="text-sm text-gray-600">{entry.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  {entry.done && <CheckCircle className="w-5 h-5 text-green-500" />}
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p className="text-gray-900 text-sm mb-3">{entry.summary}</p>

              {/* Tags + Points */}
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                  {entry.points} pts
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating Add Button */}
      <motion.button
        className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-around">
        <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Share2 className="w-5 h-5 mb-1" />
          <span className="text-xs">Share</span>
        </button>
        <button className="flex flex-col items-center text-blue-600">
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-xs font-semibold">Journal</span>
        </button>
        <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default JournalScreen;
