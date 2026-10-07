import { Dexie, type Table } from 'dexie';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
export interface AIConfig {
  id?: number;
  provider: 'ollama' | 'openai';
  baseUrl: string;
  selectedModel: string;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  apiKey?: string;
}

export interface QuizSet {
  id?: number;
  title: string;
  sourceUrl?: string;
  createdAt: Date;
  questions: QuizQuestion[];
}

export interface Flashcard {
  id: string;
  concept: string;
  explanation: string;
}

export interface FlashcardSet {
  id?: number;
  title: string;
  sourceUrl?: string;
  createdAt: Date;
  cards: Flashcard[];
}

export class AssistantDatabase extends Dexie {
  quizzes!: Table<QuizSet>;
  flashcardSets!: Table<FlashcardSet>;
  config!: Table<AIConfig>;

  constructor() {
    super('AIAssistantDB');
    this.version(2).stores({
      quizzes: '++id, title, createdAt',
      flashcardSets: '++id, title, createdAt',
      config: '++id'
    });
  }
}

export const db = new AssistantDatabase();