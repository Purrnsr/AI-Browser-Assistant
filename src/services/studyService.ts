// src/services/studyService.ts
// src/services/studyService.ts
import { db } from './db';
import type { QuizSet, FlashcardSet, QuizQuestion, Flashcard } from './db';
import { getConfig } from './configService';

export const generateQuizFromContent = async (
  content: string, 
  title: string = 'Generated Quiz',
  numQuestions: number = 5
): Promise<QuizSet> => {
  const config = await getConfig();
  
  const prompt = `
You are an educational assistant. Generate ${numQuestions} multiple-choice quiz questions based on the following content.
Return ONLY a JSON array matching this exact format:
[
  {
    "id": "q1",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why Option A is correct."
  }
]

Content:
${content.substring(0, 4000)}
`;

  const response = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.selectedModel,
      prompt,
      stream: false,
      format: 'json'
    })
  });

  const data = await response.json();
  const questions: QuizQuestion[] = JSON.parse(data.response);

  const newQuiz: QuizSet = { title, createdAt: new Date(), questions };
  const id = await db.quizzes.add(newQuiz);
  return { ...newQuiz, id };
};

export const generateFlashcardsFromContent = async (
  content: string,
  title: string = 'Generated Flashcards',
  count: number = 5
): Promise<FlashcardSet> => {
  const config = await getConfig();

  const prompt = `
You are an educational assistant. Extract ${count} key concept and explanation pairs from the text.
Return ONLY a JSON array matching this exact format:
[
  {
    "id": "fc1",
    "concept": "Term/Concept",
    "explanation": "Explanation of the term."
  }
]

Content:
${content.substring(0, 4000)}
`;

  const response = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.selectedModel,
      prompt,
      stream: false,
      format: 'json'
    })
  });

  const data = await response.json();
  const cards: Flashcard[] = JSON.parse(data.response);

  const newSet: FlashcardSet = { title, createdAt: new Date(), cards };
  const id = await db.flashcardSets.add(newSet);
  return { ...newSet, id };
};