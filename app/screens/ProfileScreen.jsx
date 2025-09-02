'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  Bell, 
  Moon, 
  Sun, 
  Target, 
  Calendar, 
  Shield, 
  FileText, 
  HelpCircle,
  ChevronRight,
  Edit3,
  Settings,
  X
} from 'lucide-react';

const ProfileScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [wellnessReminders, setWellnessReminders] = useState(true);
  const [weeklyDelivery, setWeeklyDelivery] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userEmail, setUserEmail] = useState('user@example.com');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  const toggleSwitch = (setter, currentValue) => {
    setter(!currentValue);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      console.log('Logging out...');
    }
  };

  const SwitchToggle = ({ isOn, onToggle, label, icon: Icon }) => (
    <motion.div 
      className="flex items-center justify-between py-4 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
      whileHover={{ scale: 1.01, y: -1 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <span className="text-gray-900 font-medium">{label}</span>
      </div>
      <motion.button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isOn ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
          animate={{ x: isOn ? 24 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </motion.div>
  );

  const MenuItem = ({ icon: Icon, label, onClick, showArrow = true, variant = 'default' }) => (
    <motion.button
      onClick={onClick}
      className={`flex items-center justify-between w-full py-4 px-4 rounded-xl border transition-all ${
        variant === 'danger' 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
          : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm hover:shadow-md'
      }`}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          variant === 'danger' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <Icon className={`w-5 h-5 ${variant === 'danger' ? 'text-red-600' : 'text-gray-600'}`} />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {showArrow && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </motion.button>
  );

  const EditProfileModal = () => (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
          <button
            onClick={() => setShowEditModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              placeholder="Your preferred name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-8">
          <motion.button
            onClick={() => setShowEditModal(false)}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={() => {
              setShowEditModal(false);
              // Handle save logic here
            }}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="px-4 sm:px-6 lg:px-8 pb-24 max-w-md mx-auto">
        
        {/* Header */}
        <motion.div 
          className="pt-12 pb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Profile
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Profile Info */}
          <motion.section
            {...fadeInUp}
          >
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{userEmail}</h2>
                    <p className="text-gray-500 text-xs sm:text-sm">Wellness Member</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowEditModal(true)}
                  className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 font-medium text-sm flex-shrink-0"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit
                </motion.button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">7</div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <div className="text-xs text-gray-500">Progress</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Account Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 py-4 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <span className="text-gray-500 text-sm">Email</span>
                  <p className="text-gray-900 font-medium">{userEmail}</p>
                </div>
              </div>
              
              <MenuItem
                icon={Lock}
                label="Change Password"
                onClick={() => console.log('Navigate to password change')}
              />
              
              <MenuItem
                icon={LogOut}
                label="Sign Out"
                onClick={handleLogout}
                variant="danger"
              />
            </div>
          </motion.section>

          {/* Preferences Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
            <div className="space-y-3">
              <SwitchToggle
                isOn={notifications}
                onToggle={() => toggleSwitch(setNotifications, notifications)}
                label="Push Notifications"
                icon={Bell}
              />
              
              <SwitchToggle
                isOn={darkMode}
                onToggle={() => toggleSwitch(setDarkMode, darkMode)}
                label="Dark Mode"
                icon={darkMode ? Moon : Sun}
              />
              
              <SwitchToggle
                isOn={wellnessReminders}
                onToggle={() => toggleSwitch(setWellnessReminders, wellnessReminders)}
                label="Wellness Reminders"
                icon={Target}
              />
              
              <SwitchToggle
                isOn={weeklyDelivery}
                onToggle={() => toggleSwitch(setWeeklyDelivery, weeklyDelivery)}
                label="Weekly Summary"
                icon={Calendar}
              />
            </div>
          </motion.section>

          {/* Support Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Support & Legal</h2>
            <div className="space-y-3">
              <MenuItem
                icon={HelpCircle}
                label="Help Center"
                onClick={() => console.log('Navigate to Help Center')}
              />
              
              <MenuItem
                icon={Shield}
                label="Privacy Policy"
                onClick={() => console.log('Navigate to Privacy Policy')}
              />
              
              <MenuItem
                icon={FileText}
                label="Terms of Service"
                onClick={() => console.log('Navigate to Terms of Service')}
              />
              
              <MenuItem
                icon={Settings}
                label="App Settings"
                onClick={() => console.log('Navigate to App Settings')}
              />
            </div>
          </motion.section>

          {/* App Info */}
          <motion.div 
            className="bg-gray-100 rounded-2xl p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-gray-500 text-sm">
              <p className="mb-1">Wellness App v2.1.0</p>
              <p>Made with care for your wellbeing</p>
            </div>
          </motion.div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {showEditModal && <EditProfileModal />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileScreen;