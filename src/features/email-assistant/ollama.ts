import {
  buildEmailReplyPrompt,
  buildEmailSummaryPrompt,
} from './prompts';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'llama3.2:latest';

const generateWithOllama = async (
  prompt: string
): Promise<string> => {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 400,
        num_ctx: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.response?.trim()) {
    throw new Error('Ollama returned an empty response.');
  }

  return data.response.trim();
};

export const summarizeEmail = async (
  subject: string,
  sender: string,
  body: string
): Promise<string> => {
  if (!body.trim()) {
    throw new Error('Email body is empty.');
  }

  const prompt = buildEmailSummaryPrompt(
    subject,
    sender,
    body
  );

  console.log('[Email Assistant] Generating email summary.');

  return generateWithOllama(prompt);
};

export const generateEmailReply = async (
  subject: string,
  sender: string,
  body: string,
  userIntent: string,
  responseStyle: string
): Promise<string> => {
  if (!body.trim()) {
    throw new Error('Email body is empty.');
  }

  if (!userIntent.trim()) {
    throw new Error('Please specify what you want to say in the reply.');
  }

  const prompt = buildEmailReplyPrompt(
    subject,
    sender,
    body,
    userIntent,
    responseStyle
  );

  console.log('[Email Assistant] Generating reply suggestion.');

  return generateWithOllama(prompt);
};