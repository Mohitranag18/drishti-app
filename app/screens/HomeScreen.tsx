'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import MoodSelector from '../components/MoodSelector';
import Button from '../components/Button';

const HomeScreen: React.FC = () => {
  const { state, setSelectedMood, setCurrentView } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <GlassCard>
        <h3 className="text-lg font-medium mb-4 text-white">
          Describe your current mood with an emoji
        </h3>
        <MoodSelector
          selectedMood={state.selectedMood}
          onMoodSelect={setSelectedMood}
        />
        {state.selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-pink-100 text-sm">
              Thanks for sharing! How would you like to explore this feeling?
            </p>
          </motion.div>
        )}
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-medium mb-2 text-white">Quick Check-in</h3>
        <p className="text-pink-100 text-sm mb-4">
          What&apos;s one thing that&apos;s been on your mind today?
        </p>
        <Button
          onClick={() => setCurrentView('perspective1')}
          variant="secondary"
          fullWidth
        >
          Share what&apos;s on your mind →
        </Button>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-medium mb-2 text-white">Daily Reflection</h3>
        <p className="text-pink-100 text-sm mb-4">
          Take a moment to reflect on your day and find new perspectives
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => setCurrentView('understand')}
            variant="secondary"
            size="sm"
          >
            Start Reflection
          </Button>
          <Button
            onClick={() => setCurrentView('newways')}
            variant="ghost"
            size="sm"
          >
            View Tips
          </Button>
        </div>
      </GlassCard>

      {state.selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <h3 className="text-lg font-medium mb-2 text-white">
              Mood Insights
            </h3>
            <p className="text-pink-100 text-sm">
              {state.selectedMood === '😊' && "It&apos;s wonderful that you&apos;re feeling positive! Want to explore what&apos;s contributing to this good mood?"}
              {state.selectedMood === '😐' && "Feeling neutral is completely normal. Sometimes it&apos;s good to check in with yourself when you&apos;re in this space."}
              {state.selectedMood === '😔' && "I notice you might be feeling down. Would you like to talk about what&apos;s weighing on your mind?"}
              {state.selectedMood === '😟' && "It seems like something might be troubling you. I&apos;m here to help you work through it."}
            </p>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomeScreen;