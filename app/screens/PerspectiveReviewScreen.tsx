'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const PerspectiveReviewScreen: React.FC = () => {
  const { state, setCurrentView } = useApp();

  const sampleText = state.userInput || `My coding mid-term went badly. I knew the concepts but I got stuck on one problem and panicked. My dad will be so disappointed, he keeps saying I need to get into a good company to have a secure future.`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <GlassCard>
        <h3 className="text-lg font-medium mb-3 text-white">What you shared:</h3>
        <div className="bg-white/10 rounded-lg p-4 border-l-4 border-blue-400">
          <p className="text-pink-100 leading-relaxed text-sm">
            {sampleText}
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
          <p className="text-white font-medium">Analyzing your situation...</p>
          <p className="text-pink-100 text-sm">
            I'm finding new ways to help you look at this challenge.
          </p>
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <Button
          onClick={() => setCurrentView('understand')}
          fullWidth
        >
          Continue to analysis
        </Button>
        <Button
          onClick={() => setCurrentView('perspective1')}
          variant="secondary"
        >
          Edit
        </Button>
      </div>

      <GlassCard>
        <h3 className="text-lg font-medium mb-3 text-white">What happens next?</h3>
        <div className="space-y-2 text-sm text-pink-100">
          <p>1. I'll ask a few quick questions to understand your situation better</p>
          <p>2. Based on your responses, I'll provide personalized perspectives</p>
          <p>3. You'll get actionable steps to help you move forward</p>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default PerspectiveReviewScreen;