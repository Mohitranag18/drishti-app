'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, ViewType, Question } from '../types';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setCurrentView: (view: ViewType) => void;
  setUserInput: (input: string) => void;
  setSelectedMood: (mood: string) => void;
  addResponse: (questionId: string, answer: string | number) => void;
  setLoading: (loading: boolean) => void;
  setPerspectiveStage: (stage: 'input' | 'understanding' | 'solution') => void;
  setAIQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  submitInput: () => void;
  completeUnderstanding: () => void;
}

type AppAction =
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_USER_INPUT'; payload: string }
  | { type: 'SET_SELECTED_MOOD'; payload: string }
  | { type: 'ADD_RESPONSE'; payload: { questionId: string; answer: string | number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PERSPECTIVE_STAGE'; payload: 'input' | 'understanding' | 'solution' }
  | { type: 'SET_AI_QUESTIONS'; payload: Question[] }
  | { type: 'SET_CURRENT_QUESTION_INDEX'; payload: number }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  currentView: 'home',
  userInput: '',
  selectedMood: '',
  responses: {},
  isLoading: false,
  perspectiveStage: 'input',
  aiQuestions: [],
  currentQuestionIndex: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_USER_INPUT':
      return { ...state, userInput: action.payload };
    case 'SET_SELECTED_MOOD':
      return { ...state, selectedMood: action.payload };
    case 'ADD_RESPONSE':
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.questionId]: action.payload.answer,
        },
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PERSPECTIVE_STAGE':
      return { ...state, perspectiveStage: action.payload };
    case 'SET_AI_QUESTIONS':
      return { ...state, aiQuestions: action.payload };
    case 'SET_CURRENT_QUESTION_INDEX':
      return { ...state, currentQuestionIndex: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setCurrentView = (view: ViewType) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const setUserInput = (input: string) => {
    dispatch({ type: 'SET_USER_INPUT', payload: input });
  };

  const setSelectedMood = (mood: string) => {
    dispatch({ type: 'SET_SELECTED_MOOD', payload: mood });
  };

  const addResponse = (questionId: string, answer: string | number) => {
    dispatch({ type: 'ADD_RESPONSE', payload: { questionId, answer } });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setPerspectiveStage = (stage: 'input' | 'understanding' | 'solution') => {
    dispatch({ type: 'SET_PERSPECTIVE_STAGE', payload: stage });
  };

  const setAIQuestions = (questions: Question[]) => {
    dispatch({ type: 'SET_AI_QUESTIONS', payload: questions });
  };

  const setCurrentQuestionIndex = (index: number) => {
    dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: index });
  };

  const nextQuestion = () => {
    if (state.currentQuestionIndex < state.aiQuestions.length - 1) {
      setCurrentQuestionIndex(state.currentQuestionIndex + 1);
    } else {
      completeUnderstanding();
    }
  };

  const submitInput = async () => {
    if (state.userInput.trim()) {
      setLoading(true);
      // Simulate AI processing time
      setTimeout(() => {
        // Mock AI questions based on user input
        const mockQuestions: Question[] = [
          {
            id: 'mood',
            text: "How are you feeling about this right now?",
            type: 'emoji',
            required: true
          },
          {
            id: 'frequency',
            text: "How often does this situation occur?",
            type: 'multiple-choice',
            options: ['First time', 'Sometimes', 'Often', 'Every time'],
            required: true
          },
          {
            id: 'intensity',
            text: "On a scale of 1-5, how intense is this feeling?",
            type: 'scale',
            required: true
          }
        ];
        setAIQuestions(mockQuestions);
        setCurrentQuestionIndex(0);
        setPerspectiveStage('understanding');
        setLoading(false);
      }, 2000);
    }
  };

  const completeUnderstanding = () => {
    setPerspectiveStage('solution');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setCurrentView,
        setUserInput,
        setSelectedMood,
        addResponse,
        setLoading,
        setPerspectiveStage,
        setAIQuestions,
        setCurrentQuestionIndex,
        nextQuestion,
        submitInput,
        completeUnderstanding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}