'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import Button from '../components/Button';
import MoodSelector from '../components/MoodSelector';
import ScaleSlider from '../components/ScaleSlider';


const PerspectiveScreen: React.FC = () => {
  const { 
    state, 
    setUserInput, 
    submitInput, 
    addResponse, 
    nextQuestion
  } = useApp();
  
  const [currentMood, setCurrentMood] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [scaleValue, setScaleValue] = useState(3);
  const [additionalThoughts, setAdditionalThoughts] = useState('');
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const feelingEmojis = ['😞', '😤', '😨', '😊', '😌'];
  


  const perspectiveCards = [
    {
      title: "Growth",
      content: "This challenge is an opportunity to develop new skills and resilience. Every difficult situation teaches us something valuable about ourselves and how we handle adversity.",
      relatedQuestions: [
        "What can I learn from this experience?",
        "How can I grow stronger from this?"
      ]
    },
    {
      title: "Kindness", 
      content: "It&apos;s okay to feel the way you do. Remember to be as kind to yourself as you would be to a friend going through the same situation.",
      relatedQuestions: [
        "How can I practice self-compassion?",
        "What would I tell a good friend in this situation?"
      ]
    },
    {
      title: "Action",
      content: "Small steps forward are still progress. Focus on what you can control and take one action today that moves you in a positive direction.",
      relatedQuestions: [
        "What&apos;s one small thing I can do today?",
        "How can I build momentum from here?"
      ]
    }
  ];

  const handleCardFlip = (index: number) => {
    const newFlippedCards = new Set(flippedCards);
    if (newFlippedCards.has(index)) {
      newFlippedCards.delete(index);
    } else {
      newFlippedCards.add(index);
    }
    setFlippedCards(newFlippedCards);
  };

  const handleSubmitInput = () => {
    submitInput();
  };

  const handleAnswerQuestion = () => {
    const currentQuestion = state.aiQuestions[state.currentQuestionIndex];
    if (currentQuestion) {
      let answer: string | number;
      
      switch (currentQuestion.type) {
        case 'emoji':
          answer = currentMood;
          break;
        case 'multiple-choice':
          answer = selectedOption;
          break;
        case 'scale':
          answer = scaleValue;
          break;
        case 'text':
          answer = additionalThoughts;
          break;
        default:
          answer = '';
      }
      
      addResponse(currentQuestion.id, answer);
      
      // Reset form values for next question
      setCurrentMood('');
      setSelectedOption('');
      setScaleValue(3);
      setAdditionalThoughts('');
      
      nextQuestion();
    }
  };

  const isQuestionValid = () => {
    const currentQuestion = state.aiQuestions[state.currentQuestionIndex];
    if (!currentQuestion) return false;
    
    switch (currentQuestion.type) {
      case 'emoji':
        return !!currentMood;
      case 'multiple-choice':
        return !!selectedOption;
      case 'scale':
        return true; // Scale always has a value
      case 'text':
        return !!additionalThoughts.trim();
      default:
        return false;
    }
  };

  const renderInputStage = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="space-y-4">
          <Input
            value={state.userInput}
            onChange={setUserInput}
            placeholder="Share what&apos;s bothering you, and I&apos;ll help you see it differently..."
            type="textarea"
            rows={6}
          />
          
          <Button
            onClick={handleSubmitInput}
            fullWidth
            disabled={!state.userInput.trim() || state.isLoading}
          >
            {state.isLoading ? 'Processing...' : 'Find a new perspective'}
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-medium mb-3 text-white">Tips for sharing</h3>
        <div className="space-y-2 text-sm text-pink-100">
          <p>• Be as specific as possible about the situation</p>
          <p>• Include how you&apos;re feeling about it</p>
          <p>• Don&apos;t worry about perfect grammar - just express yourself</p>
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

  const renderUnderstandingStage = () => {
    const currentQuestion = state.aiQuestions[state.currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <GlassCard>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤔</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Let&apos;s Understand Your Story
            </h3>
            <p className="text-pink-100 text-sm">
              A few quick questions so our suggestions really fit your experience
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">
                {currentQuestion.text}
              </h3>
              
              {currentQuestion.type === 'emoji' && (
                <div>
                  <p className="text-pink-100 text-sm mb-4">Pick an emoji that best describes your current emotional state</p>
                  <MoodSelector
                    selectedMood={currentMood}
                    onMoodSelect={setCurrentMood}
                    moods={feelingEmojis}
                  />
                </div>
              )}

              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={`block w-full text-left text-sm p-3 rounded-lg transition-colors ${
                        selectedOption === option
                          ? 'bg-blue-500 text-white'
                          : 'text-blue-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'scale' && (
                <ScaleSlider
                  value={scaleValue}
                  onChange={setScaleValue}
                  label="Rate your feeling on a scale of 1-5"
                  min={1}
                  max={5}
                />
              )}

              {currentQuestion.type === 'text' && (
                <Input
                  value={additionalThoughts}
                  onChange={setAdditionalThoughts}
                  placeholder="Share your thoughts..."
                  type="textarea"
                  rows={3}
                />
              )}
            </div>
          </div>
        </GlassCard>

        <div className="flex gap-3">
          <Button
            onClick={handleAnswerQuestion}
            fullWidth
            disabled={!isQuestionValid()}
          >
            {state.currentQuestionIndex < state.aiQuestions.length - 1 ? 'Next Question' : 'Complete Understanding'}
          </Button>
        </div>

        <GlassCard>
          <h3 className="text-lg font-medium mb-2 text-white">Progress</h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-blue-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((state.currentQuestionIndex + 1) / state.aiQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-pink-100 text-sm">
              {state.currentQuestionIndex + 1} of {state.aiQuestions.length}
            </span>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const renderSolutionStage = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Here are your personalized perspectives
            </h3>
            <p className="text-pink-100 text-sm">
              Based on what you shared, here are some fresh ways to look at your situation
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Perspective Cards */}
      <div className="space-y-4">
        {perspectiveCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <GlassCard>
              <div 
                className="relative cursor-pointer perspective-1000"
                onClick={() => handleCardFlip(index)}
              >
                <motion.div
                  className="w-full h-32 flex items-center justify-center"
                  animate={{ rotateY: flippedCards.has(index) ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
                >
                  {/* Front of card - Title only */}
                  <div className={`absolute inset-0 flex items-center justify-center ${flippedCards.has(index) ? 'opacity-0' : 'opacity-100'}`}>
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                  </div>
                  
                  {/* Back of card - Full content */}
                  <div className={`absolute inset-0 p-4 ${flippedCards.has(index) ? 'opacity-100' : 'opacity-0'}`} style={{ transform: 'rotateY(180deg)' }}>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-white mb-3">{card.title}</h3>
                      <p className="text-pink-100 text-sm leading-relaxed mb-4">{card.content}</p>
                      <div className="text-xs text-pink-200">
                        Click to flip back
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Related Questions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard>
          <h3 className="font-medium mb-4 text-white">Related Questions</h3>
          <div className="space-y-3">
            {perspectiveCards.flatMap((card, cardIndex) => 
              card.relatedQuestions.map((question, questionIndex) => (
                <motion.button
                  key={`${cardIndex}-${questionIndex}`}
                  className="flex items-center justify-between w-full text-left text-sm text-pink-200 hover:text-white transition-colors py-3 hover:bg-white/10 rounded-lg px-3"
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + (cardIndex * 2 + questionIndex) * 0.1 }}
                >
                  <span className="flex-1">{question}</span>
                  <span className="text-xs text-pink-300 bg-pink-400/20 px-2 py-1 rounded-full">
                    {card.title}
                  </span>
                </motion.button>
              ))
            )}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <GlassCard>
          <div className="text-center space-y-3">
            <h3 className="font-medium text-white">How are you feeling now?</h3>
            <p className="text-pink-100 text-sm">
              Take a moment to notice if your perspective has shifted
            </p>
            <div className="flex justify-center gap-3 pt-2">
              {['🌱', '💪', '😌', '🚀', '❤️'].map((emoji, index) => (
                <motion.button
                  key={emoji}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );

  const renderLoadingStage = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              🔄
            </motion.div>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Analyzing your situation...
          </h3>
          <p className="text-pink-100 text-sm">
            Our AI is crafting personalized questions to better understand your experience
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {state.isLoading && renderLoadingStage()}
      {!state.isLoading && state.perspectiveStage === 'input' && renderInputStage()}
      {!state.isLoading && state.perspectiveStage === 'understanding' && renderUnderstandingStage()}
      {!state.isLoading && state.perspectiveStage === 'solution' && renderSolutionStage()}
    </AnimatePresence>
  );
};

export default PerspectiveScreen; 