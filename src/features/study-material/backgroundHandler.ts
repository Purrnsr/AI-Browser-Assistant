import { generateStudyMaterial } from './ollama';
import type {
  GenerateStudyMaterialRequest,
  GenerateStudyMaterialResponse,
} from './messages';

export const handleGenerateStudyMaterialMessage = async (
  message: GenerateStudyMaterialRequest
): Promise<GenerateStudyMaterialResponse> => {
  try {
    const studyMaterial = await generateStudyMaterial(message.content);

    return {
      success: true,
      studyMaterial,
    };
  } catch (error) {
    console.error(
      '[Study Material] Generation failed:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate study material.',
    };
  }
};