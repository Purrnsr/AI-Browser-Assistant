export type SelectedTextOperation =
  | 'explain'
  | 'simplify'
  | 'rephrase';

export const buildSelectedTextPrompt = (
  text: string,
  operation: SelectedTextOperation
): string => {
  switch (operation) {
    case 'explain':
      return `Explain the following selected text clearly.

Requirements:
- Explain the meaning in simple language.
- Preserve the original meaning.
- Provide useful context only when it is directly supported by the text.
- Do not invent facts.

Selected text:

${text}`;

    case 'simplify':
      return `Simplify the following selected text.

Requirements:
- Use simple and easy-to-understand language.
- Preserve the original meaning.
- Do not remove important information.
- Do not add information that is not present in the original text.

Selected text:

${text}`;

    case 'rephrase':
      return `Rephrase the following selected text.

Requirements:
- Preserve the original meaning.
- Improve clarity and readability.
- Use natural language.
- Do not add new information.

Selected text:

${text}`;

    default:
      throw new Error('Unsupported selected-text operation.');
  }
};