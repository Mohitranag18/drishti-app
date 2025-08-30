'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PerspectiveCard from '../components/PerspectiveCard';
import GlassCard from '../components/GlassCard';

const NewWaysScreen: React.FC = () => {
  const { } = useApp();

  const perspectiveCards = [
    {
      title: "Growth",
      content: "Panicking isn&apos;t about knowledge, but about managing test pressure & moments. This setback is a chance to learn a new skill—it&apos;s a measure of your worth. How could you prepare for handling panic next time?",
      relatedQuestions: [
        "What breathing techniques can help during exams?",
        "How do successful people handle test anxiety?"
      ]
    },
    {
      title: "Kindness", 
      content: "It&apos;s okay to feel disappointed—in yourself or from family. Remember: You tried your best in that moment. How would you comfort a friend who felt this way? Try being that friend for yourself now.",
      relatedQuestions: [
        "How can I practice self-compassion?",
        "What would I tell a good friend in this situation?"
      ]
    },
    {
      title: "Action",
      content: "The next 15 minutes are yours. Try one thing that helps you decompress, like playing a favorite song or taking a short break outside. Mark it 'done' and reward yourself for every small step forward.",
      relatedQuestions: [
        "What are quick ways to de-stress?",
        "How can I build small wins into my day?"
      ]
    }
  ];

  const relatedQuestions = [
    "How do I stop panic happening again?",
    "What if my dad doesn't understand?", 
    "Can you give me another action that's easy to do tonight?",
    "How do I build confidence for coding exams?"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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

      <div className="space-y-4">
        {perspectiveCards.map((card, index) => (
          <PerspectiveCard
            key={index}
            title={card.title}
            content={card.content}
            relatedQuestions={card.relatedQuestions}
            index={index}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard>
          <h3 className="font-medium mb-4 text-white">More questions you might have</h3>
          <div className="space-y-2">
            {relatedQuestions.map((question, index) => (
              <motion.button
                key={index}
                className="flex items-center justify-between w-full text-left text-sm text-pink-200 hover:text-white transition-colors py-3 hover:bg-white/10 rounded-lg px-3"
                whileHover={{ x: 5 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <span className="flex-1">{question}</span>
                <Plus className="w-4 h-4 ml-2 flex-shrink-0" />
              </motion.button>
            ))}
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
};

export default NewWaysScreen;