'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import MoodSelector from '../components/MoodSelector';
import Button from '../components/Button';
import Input from '../components/Input';
import ScaleSlider from '../components/ScaleSlider';

const UnderstandScreen: React.FC = () => {
  const { state, setCurrentView, addResponse } = useApp();
  const [currentMood, setCurrentMood] = useState('');
  const [panicFrequency, setPanicFrequency] = useState('');
  const [anxietyLevel, setAnxietyLevel] = useState(3);
  const [additionalThoughts, setAdditionalThoughts] = useState('');

  const feelingEmojis = ['😞', '😤', '😨', '😊', '😌'];
  
  const panicOptions = [
    { key: 'first', label: 'First time' },
    { key: 'sometimes', label: 'Sometimes' },
    { key: 'every', label: 'Every exam' },
    { key: 'not-sure', label: 'Not sure' }
  ];

  const handleContinue = () => {
    // Save responses
    addResponse('current-mood', currentMood);
    addResponse('panic-frequency', panicFrequency);
    addResponse('anxiety-level', anxietyLevel);
    addResponse('additional-thoughts', additionalThoughts);
    
    setCurrentView('newways');
  };

  const isFormValid = currentMood && panicFrequency;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">
              How are you feeling about this right now?
            </h3>
            <p className="text-pink-100 text-sm mb-4">Pick an emoji that best describes your current emotional state</p>
            <MoodSelector
              selectedMood={currentMood}
              onMoodSelect={setCurrentMood}
              moods={feelingEmojis}
            />
          </div>

          <div>
            <p className="text-sm mb-3 text-white">
              Was this the first time you felt panicked in an exam, or has it happened before?
            </p>
            <div className="space-y-2">
              {panicOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setPanicFrequency(option.key)}
                  className={`block w-full text-left text-sm p-3 rounded-lg transition-colors ${
                    panicFrequency === option.key
                      ? 'bg-blue-500 text-white'
                      : 'text-blue-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <ScaleSlider
            value={anxietyLevel}
            onChange={setAnxietyLevel}
            label="On a scale of 1-5, how much do you agree: 'My dad's expectations make me anxious.'"
            min={1}
            max={5}
          />

          <div>
            <Input
              value={additionalThoughts}
              onChange={setAdditionalThoughts}
              placeholder="Anything else you'd like to share about this situation?"
              type="textarea"
              rows={3}
            />
          </div>
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <Button
          onClick={handleContinue}
          fullWidth
          disabled={!isFormValid}
        >
          Get New Perspective
        </Button>
      </div>

      {currentMood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard>
            <h3 className="text-lg font-medium mb-2 text-white">Quick Insight</h3>
            <p className="text-pink-100 text-sm">
              {currentMood === '😞' && "It's completely understandable to feel disappointed. These feelings are valid and temporary."}
              {currentMood === '😤' && "I can sense some frustration. Let's channel that energy into positive action."}
              {currentMood === '😨' && "Anxiety can feel overwhelming, but you're taking a brave step by reflecting on it."}
              {currentMood === '😊' && "I'm glad you're approaching this with a positive mindset. That's a great foundation for growth."}
              {currentMood === '😌' && "Your calm approach to this situation shows emotional maturity and self-awareness."}
            </p>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard>
        <h3 className="text-lg font-medium mb-2 text-white">Progress</h3>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-blue-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: isFormValid ? '100%' : '60%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-pink-100 text-sm">
            {isFormValid ? 'Complete' : 'Almost there'}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default UnderstandScreen;