export interface User {
  id: string;
  name: string;
  email?: string;
  currentMood?: string;
  responses: UserResponse[];
}

export interface UserResponse {
  questionId: string;
  answer: string | number;
  timestamp: Date;
}

export interface MoodEntry {
  emoji: string;
  timestamp: Date;
  context?: string;
}

export interface PerspectiveCard {
  id: string;
  title: string;
  content: string;
  category: 'growth' | 'kindness' | 'action';
  relatedQuestions: string[];
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'emoji' | 'scale' | 'multiple-choice';
  options?: string[];
  required: boolean;
}

export interface Screen {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

export type ViewType = 'home' | 'perspective1' | 'perspective2' | 'understand' | 'newways' | 'profile' | 'journal';

export interface AppState {
  currentView: ViewType;
  userInput: string;
  selectedMood: string;
  responses: Record<string, string | number>;
  isLoading: boolean;
  perspectiveStage: 'input' | 'understanding' | 'solution';
  aiQuestions: Question[];
  currentQuestionIndex: number;
}