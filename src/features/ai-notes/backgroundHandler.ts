import { generateNotes } from './ollama';
import type {
  GenerateNotesRequest,
  GenerateNotesResponse,
} from './messages';

export const handleGenerateNotesMessage = async (
  message: GenerateNotesRequest
): Promise<GenerateNotesResponse> => {
  try {
    const notes = await generateNotes(message.content);

    return {
      success: true,
      notes,
    };
  } catch (error) {
    console.error('[AI Notes] Note generation failed:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate notes.',
    };
  }
};