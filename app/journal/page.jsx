'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Calendar, 
  Search, 
  Filter,
  BookOpen,
  Heart,
  Smile,
  Frown,
  Meh,
  Edit3,
  Trash2,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useApp } from '../context/AppContext';

const JournalScreen = () => {
  const { setCurrentView } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryMood, setNewEntryMood] = useState('');
  
  // Mock journal entries
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 1,
      title: "A day of growth and reflection",
      content: "Today I practiced mindfulness meditation for the first time in weeks. It felt really good to reconnect with myself and find some inner peace...",
      date: "2024-01-15",
      mood: "happy",
      tags: ["mindfulness", "growth", "meditation"],
      favorite: true
    },
    {
      id: 2,
      title: "Challenging day at work",
      content: "Work was particularly stressful today. Had a difficult conversation with my manager, but I'm proud of how I handled it with composure...",
      date: "2024-01-14", 
      mood: "neutral",
      tags: ["work", "stress", "growth"],
      favorite: false
    },
    {
      id: 3,
      title: "Weekend reflections",
      content: "Spent quality time with family this weekend. It reminded me of what's truly important in life. Feeling grateful for these moments...",
      date: "2024-01-13",
      mood: "happy",
      tags: ["family", "gratitude", "weekend"],
      favorite: true
    }
  ]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  const moodEmojis = {
    happy: { emoji: '😊', color: 'text-green-500', bg: 'bg-green-50' },
    neutral: { emoji: '😐', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    sad: { emoji: '😔', color: 'text-blue-500', bg: 'bg-blue-50' },
    stressed: { emoji: '😟', color: 'text-red-500', bg: 'bg-red-50' }
  };

  const handleNewEntry = () => {
    if (newEntryContent.trim() && newEntryMood) {
      const newEntry = {
        id: Date.now(),
        title: newEntryContent.split('\n')[0] || "New Entry",
        content: newEntryContent,
        date: new Date().toISOString().split('T')[0],
        mood: newEntryMood,
        tags: [],
        favorite: false
      };
      setJournalEntries([newEntry, ...journalEntries]);
      setNewEntryContent('');
      setNewEntryMood('');
      setShowNewEntry(false);
    }
  };

  const toggleFavorite = (id) => {
    setJournalEntries(entries => 
      entries.map(entry => 
        entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
      )
    );
  };

  const deleteEntry = (id) => {
    setJournalEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="px-4 sm:px-6 lg:px-8 pb-24 max-w-md mx-auto">
          
          {/* Header */}
          <motion.div 
            className="pt-12 pb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Journal
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Your thoughts and reflections
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={() => setShowNewEntry(true)}
                className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusCircle className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div 
            className="mb-6 space-y-3"
            {...fadeInUp}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All', icon: Filter },
                { key: 'happy', label: 'Happy', icon: Smile },
                { key: 'neutral', label: 'Neutral', icon: Meh },
                { key: 'sad', label: 'Sad', icon: Frown },
              ].map((filter) => (
                <motion.button
                  key={filter.key}
                  onClick={() => setSelectedMood(filter.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                    selectedMood === filter.key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <filter.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{journalEntries.length}</div>
              <div className="text-xs text-gray-500">Total Entries</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">7</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{journalEntries.filter(e => e.favorite).length}</div>
              <div className="text-xs text-gray-500">Favorites</div>
            </div>
          </motion.div>

          {/* Journal Entries */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredEntries.map((entry, index) => {
                const moodData = moodEmojis[entry.mood] || moodEmojis.neutral;
                
                return (
                  <motion.div
                    key={entry.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${moodData.bg} rounded-xl flex items-center justify-center`}>
                          <span className="text-lg">{moodData.emoji}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {entry.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(entry.date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => toggleFavorite(entry.id)}
                          className={`p-1.5 rounded-full transition-colors ${
                            entry.favorite 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Star className={`w-4 h-4 ${entry.favorite ? 'fill-current' : ''}`} />
                        </motion.button>
                        <motion.button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
                      {entry.content}
                    </p>
                    
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>2 min read</span>
                      </div>
                      <motion.button
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Read more</span>
                        <ChevronRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredEntries.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || selectedMood !== 'all' ? 'No entries found' : 'Start your journal'}
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-4">
                {searchQuery || selectedMood !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Begin documenting your thoughts, feelings, and daily reflections'
                }
              </p>
              {!searchQuery && selectedMood === 'all' && (
                <motion.button
                  onClick={() => setShowNewEntry(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Write your first entry
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* New Entry Modal */}
        <AnimatePresence>
          {showNewEntry && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">New Entry</h3>
                  <button
                    onClick={() => setShowNewEntry(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How are you feeling?
                    </label>
                    <div className="flex gap-3">
                      {Object.entries(moodEmojis).map(([key, data]) => (
                        <motion.button
                          key={key}
                          onClick={() => setNewEntryMood(key)}
                          className={`p-3 rounded-xl transition-all ${
                            newEntryMood === key 
                              ? `${data.bg} ring-2 ring-blue-500` 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-xl">{data.emoji}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your thoughts
                    </label>
                    <textarea
                      value={newEntryContent}
                      onChange={(e) => setNewEntryContent(e.target.value)}
                      placeholder="What's on your mind? Share your thoughts, feelings, or reflections from today..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <motion.button
                    onClick={() => setShowNewEntry(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleNewEntry}
                    disabled={!newEntryContent.trim() || !newEntryMood}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                      newEntryContent.trim() && newEntryMood
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    whileHover={newEntryContent.trim() && newEntryMood ? { scale: 1.02 } : {}}
                    whileTap={newEntryContent.trim() && newEntryMood ? { scale: 0.98 } : {}}
                  >
                    Save Entry
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
};

export default JournalScreen;
