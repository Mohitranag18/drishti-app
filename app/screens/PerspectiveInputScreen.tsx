'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import Button from '../components/Button';

const PerspectiveInputScreen: React.FC = () => {
  const { state, setUserInput, setCurrentView } = useApp();

  const handleContinue = () => {
    if (state.userInput.trim()) {
      setCurrentView('perspective2');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="space-y-4">
          <Input
            value={state.userInput}
            onChange={setUserInput}
            placeholder="Share what's bothering you, and I'll help you see it differently..."
            type="textarea"
            rows={6}
          />
          
          <Button
            onClick={handleContinue}
            fullWidth
            disabled={!state.userInput.trim()}
          >
            Find a new perspective
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-medium mb-3 text-white">Tips for sharing</h3>
        <div className="space-y-2 text-sm text-pink-100">
          <p>• Be as specific as possible about the situation</p>
          <p>• Include how you're feeling about it</p>
          <p>• Don't worry about perfect grammar - just express yourself</p>
          <p>• Remember, this is a safe space to share</p>
        </div>
      </GlassCard>

      {state.userInput.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between">
              <span className="text-pink-100 text-sm">Characters: {state.userInput.length}</span>
              <Button
                onClick={() => setUserInput('')}
                variant="ghost"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PerspectiveInputScreen;