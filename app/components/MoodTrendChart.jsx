'use client';

import React from 'react';
import { motion } from 'framer-motion';

const MoodTrendChart = ({ data = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          7-Day Mood Trend
        </h3>
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          7-Day Mood Trend
        </h3>
        <div className="h-32 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No mood data available</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking your mood to see trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const chartHeight = 120;
  const chartWidth = 280;
  const maxMoodRate = 10;
  
  // Generate path for the mood line
  const generatePath = (data) => {
    if (data.length === 0) return '';
    
    const validData = data.filter(d => d.mood_rate !== null);
    if (validData.length === 0) return '';
    
    const pointWidth = chartWidth / (data.length - 1);
    
    let path = '';
    validData.forEach((point, index) => {
      const originalIndex = data.findIndex(d => d.date === point.date);
      const x = originalIndex * pointWidth;
      const y = chartHeight - (point.mood_rate / maxMoodRate) * chartHeight;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  const pathData = generatePath(data);
  const hasValidData = data.some(d => d.mood_rate !== null);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          7-Day Mood Trend
        </h3>
        <div className="text-sm text-gray-500">
          Last week
        </div>
      </div>

      <div className="relative">
        {/* Chart container */}
        <div className="h-32 relative mb-4">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="absolute top-0 left-0"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Grid lines */}
            {[2, 4, 6, 8, 10].map((value) => (
              <line
                key={value}
                x1="0"
                y1={chartHeight - (value / maxMoodRate) * chartHeight}
                x2={chartWidth}
                y2={chartHeight - (value / maxMoodRate) * chartHeight}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Mood line */}
            {pathData && hasValidData && (
              <motion.path
                d={pathData}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            )}
            
            {/* Data points */}
            {data.map((point, index) => {
              if (point.mood_rate === null) return null;
              
              const x = (index / (data.length - 1)) * chartWidth;
              const y = chartHeight - (point.mood_rate / maxMoodRate) * chartHeight;
              
              return (
                <motion.g key={point.date}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  />
                  
                  {/* Mood emoji */}
                  {point.mood_emoji && (
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fontSize="12"
                      className="select-none"
                    >
                      {point.mood_emoji}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Day labels */}
        <div className="flex justify-between text-xs text-gray-500">
          {data.map((point, index) => (
            <div key={point.date} className="text-center">
              <div className="font-medium">{point.day}</div>
              <div className="text-gray-400">
                {new Date(point.date).getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Mood scale */}
        <div className="absolute -left-6 top-0 h-32 flex flex-col justify-between text-xs text-gray-400">
          <span>😊 10</span>
          <span>😐 5</span>
          <span>😔 1</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        {(() => {
          const validMoods = data.filter(d => d.mood_rate !== null);
          if (validMoods.length === 0) return 'Start tracking your mood to see trends';
          
          const average = validMoods.reduce((sum, d) => sum + d.mood_rate, 0) / validMoods.length;
          const trend = validMoods.length >= 2 ? 
            validMoods[validMoods.length - 1].mood_rate - validMoods[0].mood_rate : 0;
          
          if (trend > 1) return '📈 Your mood has been improving this week!';
          if (trend < -1) return '📉 Consider some self-care activities';
          return '📊 Your mood has been relatively stable';
        })()}
      </div>
    </div>
  );
};

export default MoodTrendChart;
