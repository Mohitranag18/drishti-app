'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Settings, Check, X, Loader2, Send, Bell, BellOff } from 'lucide-react';

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    weekly_summary: true,
    monthly_summary: true,
    milestones: true,
    daily_reminders: false,
    enabled: true
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch current preferences
  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/email-preferences', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
        setEmail(data.email);
      } else {
        throw new Error('Failed to fetch preferences');
      }
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load email preferences' });
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Email preferences saved successfully!' });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving email preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save email preferences' });
    } finally {
      setSaving(false);
    }
  };

  // Send test email
  const sendTestEmail = async (type) => {
    setTesting(type);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      
      const data = await response.json();
      
      if (response.ok && data.result.success) {
        setMessage({ 
          type: 'success', 
          text: `Test ${type} email sent to ${email}! Check your inbox.` 
        });
      } else {
        throw new Error(data.result?.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setMessage({ type: 'error', text: 'Failed to send test email' });
    } finally {
      setTesting(null);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const emailOptions = [
    {
      key: 'weekly_summary',
      title: 'Weekly Summary Emails',
      description: 'Receive detailed weekly wellness summaries with insights and progress tracking',
      icon: '📊',
      testable: true,
      testType: 'weekly'
    },
    {
      key: 'monthly_summary',
      title: 'Monthly Report Emails',
      description: 'Get comprehensive monthly wellness reports with deep analysis and trends',
      icon: '📈',
      testable: true,
      testType: 'monthly'
    },
    {
      key: 'milestones',
      title: 'Milestone Celebrations',
      description: 'Celebrate your achievements and important wellness milestones',
      icon: '🏆',
      testable: false
    },
    {
      key: 'daily_reminders',
      title: 'Daily Reminders',
      description: 'Gentle reminders for daily reflection and wellness activities',
      icon: '🌅',
      testable: false
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-600">Loading email preferences...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h1>
        <p className="text-gray-600">Manage your email notifications and stay connected with your wellness journey</p>
      </motion.div>

      {/* Email Display */}
      <motion.div 
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Email Address</h3>
            <p className="text-gray-600">{email}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            preferences.enabled 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {preferences.enabled ? 'Active' : 'Disabled'}
          </div>
        </div>
      </motion.div>

      {/* Master Toggle */}
      <motion.div 
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              preferences.enabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {preferences.enabled ? (
                <Bell className="w-6 h-6 text-green-600" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Enable Email Notifications</h3>
              <p className="text-gray-600 text-sm">Turn all email notifications on or off</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Email Options */}
      <div className="space-y-4">
        {emailOptions.map((option, index) => (
          <motion.div
            key={option.key}
            className={`bg-white rounded-xl border transition-all ${
              preferences.enabled && preferences[option.key]
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{option.title}</h3>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(option.key)}
                  disabled={!preferences.enabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !preferences.enabled ? 'bg-gray-200 cursor-not-allowed' :
                    preferences[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[option.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {option.testable && preferences.enabled && preferences[option.key] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => sendTestEmail(option.testType)}
                    disabled={testing === option.testType}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {testing === option.testType ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Test Email</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      <motion.div 
        className="mt-8 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Settings className="w-5 h-5" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailPreferences;
