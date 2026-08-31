import { processSelectedText } from './ollama';
import type {
  SelectedTextRequest,
  SelectedTextResponse,
} from './messages';

export const handleSelectedTextMessage = async (
  message: SelectedTextRequest
): Promise<SelectedTextResponse> => {
  try {
    const result = await processSelectedText(
  message.text,
  message.operation,
  message.targetLanguage
);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('[Selected Text] Processing failed:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to process selected text.',
    };
  }
};