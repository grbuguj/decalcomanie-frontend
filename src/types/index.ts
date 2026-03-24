export interface Persona {
  name: string;
  speechStyle: string;
  avgMessageLength: string;
  commonPhrases: string[];
  endingPatterns: string;
  endingStyle?: string;
  typingHabits?: string;
  burstPattern?: string;
  topics?: string[];
  memories: string[];
  mbti?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type Step = 'upload' | 'select' | 'persona' | 'chat';
