export interface Persona {
  name: string;
  speechStyle: string;
  avgMessageLength: string;
  commonPhrases: string[];
  endingPatterns: string;
  memories: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type Step = 'upload' | 'select' | 'chat';
