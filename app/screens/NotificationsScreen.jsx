'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, AlertCircle, Trash2, Settings } from 'lucide-react';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'reminder',
      title: 'Daily Reflection Time',
      message: 'Take a moment to reflect on your day and practice gratitude.',
      time: '2 hours ago',
      read: false,
      icon: Clock
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Perspective Milestone',
      message: 'You\'ve completed 5 perspective exercises this week! Keep up the great work.',
      time: '1 day ago',
      read: true,
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'tip',
      title: 'Mindfulness Tip',
      message: 'Try taking 3 deep breaths when you feel overwhelmed. This simple technique can help center your mind.',
      time: '2 days ago',
      read: true,
      icon: AlertCircle
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Weekly Check-in',
      message: 'How are you feeling this week? Time for your weekly mood check and reflection.',
      time: '3 days ago',
      read: true,
      icon: Clock
    }
  ]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const getNotificationColors = (type, read) => {
    const baseColors = {
      reminder: {
        bg: read ? 'bg-blue-50' : 'bg-blue-100',
        icon: 'bg-blue-100 text-blue-600',
        border: read ? 'border-blue-100' : 'border-blue-200'
      },
      achievement: {
        bg: read ? 'bg-emerald-50' : 'bg-emerald-100',
        icon: 'bg-emerald-100 text-emerald-600',
        border: read ? 'border-emerald-100' : 'border-emerald-200'
      },
      tip: {
        bg: read ? 'bg-purple-50' : 'bg-purple-100',
        icon: 'bg-purple-100 text-purple-600',
        border: read ? 'border-purple-100' : 'border-purple-200'
      }
    };
    return baseColors[type] || baseColors.reminder;
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                {unreadCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <span className="text-white text-xs font-bold">{unreadCount}</span>
                  </motion.div>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Updates
                </h1>
                <p className="text-gray-600 text-sm">
                  {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <motion.button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mark all read
                </motion.button>
              )}
              <motion.button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification, index) => {
              const IconComponent = notification.icon;
              const colors = getNotificationColors(notification.type, notification.read);
              
              return (
                <motion.div
                  key={notification.id}
                  className={`${colors.bg} ${colors.border} border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden`}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon} flex-shrink-0`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 400 }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-semibold text-gray-900 text-sm ${!notification.read ? 'font-bold' : ''}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 leading-relaxed pr-2">
                        {notification.message}
                      </p>
                      
                      {!notification.read && (
                        <motion.div 
                          className="flex items-center space-x-2 pt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-600 font-medium">New</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              You're all caught up. We'll notify you when there's something new to check out.
            </p>
          </motion.div>
        )}

        {/* Quick Actions */}
        {notifications.length > 0 && (
          <motion.div 
            className="mt-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                className="p-3 bg-blue-50 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Notification Settings
              </motion.button>
              <motion.button
                className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View All History
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;