'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, RotateCcw, Lightbulb, Heart, Target, TrendingUp, Sparkles } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useApp } from '../context/AppContext';

const PerspectiveScreen = () => {
  const { setCurrentView } = useApp();
  const [currentStage, setCurrentStage] = useState('input'); // 'input', 'understanding', 'solution'
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [sessionId, setSessionId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [perspectiveCards, setPerspectiveCards] = useState([]);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [error, setError] = useState('');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  const getTitle = () => {
    if (currentStage === 'input') return "What's on your mind?";
    if (currentStage === 'understanding') return "Let's understand better";
    if (currentStage === 'solution') return "New perspectives";
    return "What's on your mind?";
  };

  const getSubtitle = () => {
    if (currentStage === 'input') return "Share what's bothering you, and I'll help you see it differently";
    if (currentStage === 'understanding') return "A few questions to personalize your experience";
    if (currentStage === 'solution') return "Fresh ways to approach your situation";
    return "Share what's bothering you, and I'll help you see it differently";
  };

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const handleSubmitInput = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch('/api/perspective/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userInput: userInput.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      setSessionId(data.sessionId);
      
      // Generate quiz questions
      await generateQuizQuestions(data.sessionId);

    } catch (err) {
      setError(err.message);
      console.error('Error creating session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizQuestions = async (sessionId) => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/perspective/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sessionId, 
          userInput: userInput.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setQuizQuestions(data.questions);
      setCurrentStage('understanding');

    } catch (err) {
      setError(err.message);
      console.error('Error generating quiz:', err);
    }
  };

  const handleQuizAnswer = (questionId, value) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCompleteUnderstanding = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      
      // Submit answers
      const answersArray = Object.entries(quizAnswers).map(([questionId, value]) => ({
        questionId,
        value
      }));

      const submitResponse = await fetch('/api/perspective/submit-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sessionId, 
          answers: answersArray
        })
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit answers');
      }

      // Generate perspective cards
      const cardsResponse = await fetch('/api/perspective/generate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const cardsData = await cardsResponse.json();

      if (!cardsResponse.ok) {
        throw new Error(cardsData.error || 'Failed to generate perspective cards');
      }

      setPerspectiveCards(cardsData.cards);
      setPointsEarned(cardsData.pointsEarned);
      setCurrentStage('solution');

    } catch (err) {
      setError(err.message);
      console.error('Error completing understanding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToJournal = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/perspective/save-to-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save to journal');
      }

      setPointsEarned(prev => prev + data.pointsEarned);
      alert(`Saved to journal! You earned ${data.pointsEarned} bonus points.`);

    } catch (err) {
      setError(err.message);
      console.error('Error saving to journal:', err);
    }
  };

  const handleCardFlip = (index) => {
    const newFlippedCards = new Set(flippedCards);
    if (newFlippedCards.has(index)) {
      newFlippedCards.delete(index);
    } else {
      newFlippedCards.add(index);
    }
    setFlippedCards(newFlippedCards);
  };

  const resetToInput = () => {
    setCurrentStage('input');
    setUserInput('');
    setSessionId(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setPerspectiveCards([]);
    setPointsEarned(0);
    setFlippedCards(new Set());
    setError('');
  };

  const isUnderstandingFormValid = () => {
    return quizQuestions.every(q => quizAnswers[q.id] !== undefined && quizAnswers[q.id] !== '');
  };

  const renderQuizQuestion = (question, index) => {
    const value = quizAnswers[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <div key={question.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {question.question}
            </h3>
            <textarea
              value={value}
              onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div key={question.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {question.question}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {question.options.map((option, optionIndex) => (
                <motion.button
                  key={optionIndex}
                  onClick={() => handleQuizAnswer(question.id, option)}
                  className={`text-sm p-3 rounded-xl transition-colors border text-left ${
                    value === option
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'scale':
        return (
          <div key={question.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {question.question} ({value || question.min}/{question.max})
            </h3>
            <div className="space-y-4">
              <input
                type="range"
                min={question.min}
                max={question.max}
                value={value || question.min}
                onChange={(e) => handleQuizAnswer(question.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{question.minLabel || 'Low'}</span>
                <span>{question.maxLabel || 'High'}</span>
              </div>
            </div>
            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #2563eb;
                cursor: pointer;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
              }
              .slider::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #2563eb;
                cursor: pointer;
                border: none;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
              }
            `}</style>
          </div>
        );

      case 'emoji':
        return (
          <div key={question.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {question.question}
            </h3>
            <div className="flex justify-center gap-3">
              {question.options.map((emoji, emojiIndex) => (
                <motion.button
                  key={emojiIndex}
                  onClick={() => handleQuizAnswer(question.id, emoji)}
                  className={`text-2xl p-3 rounded-2xl transition-all ${
                    value === emoji 
                      ? 'bg-blue-100 scale-110 shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: value === emoji ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'growth': return TrendingUp;
      case 'compassion': return Heart;
      case 'action': return Target;
      default: return Lightbulb;
    }
  };

  const getCardGradient = (type) => {
    switch (type) {
      case 'growth': return 'from-blue-400 to-indigo-500';
      case 'compassion': return 'from-emerald-400 to-cyan-500';
      case 'action': return 'from-purple-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const renderInputStage = () => (
    <motion.div
      key="input"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Share your thoughts</span>
          </div>
          
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="What's bothering you today? The more specific you are, the better I can help..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{userInput.length} characters</span>
            {userInput.length > 0 && (
              <button
                onClick={() => setUserInput('')}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          <motion.button
            onClick={handleSubmitInput}
            disabled={!userInput.trim() || isLoading}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              userInput.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={userInput.trim() && !isLoading ? { scale: 1.02 } : {}}
            whileTap={userInput.trim() && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <span>Find new perspective</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <span>Tips for sharing</span>
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Be specific about the situation and your feelings</p>
          <p>• Include context about when and where this happens</p>
          <p>• Don't worry about perfect grammar - just express yourself</p>
          <p>• This is a safe space to be honest about your emotions</p>
        </div>
      </div>
    </motion.div>
  );

  const renderUnderstandingStage = () => (
    <motion.div
      key="understanding"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Quiz Questions */}
      {quizQuestions.map((question, index) => (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderQuizQuestion(question, index)}
        </motion.div>
      ))}

      {/* Continue Button */}
      <div className="sticky bottom-6">
        <motion.button
          onClick={handleCompleteUnderstanding}
          disabled={!isUnderstandingFormValid() || isLoading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center space-x-2 ${
            isUnderstandingFormValid() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={isUnderstandingFormValid() && !isLoading ? { scale: 1.02 } : {}}
          whileTap={isUnderstandingFormValid() && !isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              <span>{isUnderstandingFormValid() ? 'Get New Perspective →' : 'Please complete all questions'}</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderSolutionStage = () => (
    <motion.div
      key="solution"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Header */}
      <motion.div
        className="bg-gradient-to-br from-emerald-50 to-cyan-100 rounded-2xl p-6 border border-emerald-200 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Here are your personalized perspectives
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          Based on what you shared, here are some fresh ways to approach your situation
        </p>
        {pointsEarned > 0 && (
          <div className="bg-white rounded-lg px-3 py-2 inline-block">
            <span className="text-emerald-600 font-semibold text-sm">
              🎉 +{pointsEarned} points earned!
            </span>
          </div>
        )}
      </motion.div>

      {/* Perspective Cards */}
      <div className="space-y-6">
        {perspectiveCards.map((card, index) => {
          const IconComponent = getCardIcon(card.type);
          const gradientClass = getCardGradient(card.type);

          return (
            <motion.div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl overflow-hidden transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div
                className="cursor-pointer"
                onClick={() => handleCardFlip(index)}
              >
                {/* Card Header */}
                <div
                  className={`h-28 bg-gradient-to-r ${gradientClass} flex items-center justify-center relative group`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg">{card.title}</h3>
                  </div>

                  {/* Rotate Icon */}
                  <div className="absolute top-3 right-3">
                    <motion.div
                      animate={{ rotate: flippedCards.has(index) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {flippedCards.has(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                      className="p-6 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white"
                    >
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {card.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>


      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={resetToInput}
          className="flex items-center justify-center space-x-2 p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="font-medium">Try Again</span>
        </motion.button>
        
        <motion.button
          onClick={handleSaveToJournal}
          className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Heart className="w-4 h-4" />
          <span className="font-medium">Save Insights</span>
        </motion.button>
      </div>
    </motion.div>
  );

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
            <div className="flex items-center space-x-3 mb-4">
              {currentStage !== 'input' && (
                <motion.button
                  onClick={() => setCurrentStage(currentStage === 'solution' ? 'understanding' : 'input')}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </motion.button>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {getTitle()}
                </h1>
                <p className="text-gray-600 text-sm">
                  {getSubtitle()}
                </p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <motion.div
                  className="bg-blue-600 h-1.5 rounded-full"
                  initial={{ width: "33%" }}
                  animate={{ 
                    width: currentStage === 'input' ? "33%" : 
                           currentStage === 'understanding' ? "66%" : "100%" 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {currentStage === 'input' && 'Step 1 of 3'}
                {currentStage === 'understanding' && 'Step 2 of 3'}
                {currentStage === 'solution' && 'Complete'}
              </span>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {currentStage === 'input' && renderInputStage()}
            {currentStage === 'understanding' && renderUnderstandingStage()}
            {currentStage === 'solution' && renderSolutionStage()}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PerspectiveScreen;