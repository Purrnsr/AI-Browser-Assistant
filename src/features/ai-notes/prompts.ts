export const buildNotesPrompt = (content: string): string => {
  const MAX_NOTES_INPUT = 8000;
  const notesContent = content.slice(0, MAX_NOTES_INPUT);

  return `You are an AI note-taking assistant.

Analyze the following webpage content and create clear, structured study notes.

Follow this exact structure:

# Title
Give a short title describing the main topic.

# Key Concepts
List the most important concepts from the content.
- Explain each concept briefly and clearly.

# Important Points
List the most important facts, ideas, arguments, or takeaways.
- Keep each point concise.

# Definitions
List important terms and their meanings.
- Include only definitions that are supported by the provided content.

# Concise Explanation
Provide a short explanation that connects the main ideas together.

Requirements:
- Use only information present in the provided content.
- Do not invent facts or add outside information.
- Use simple, clear language.
- Prefer bullet points over long paragraphs.
- Remove navigation menus, advertisements, repeated text, and irrelevant webpage content.
- Keep the notes concise but useful for studying.
- Preserve important technical terms, names, numbers, and facts when present.
- Preserve every [[IMAGE:N]] marker exactly as it appears in the source content when that visual is relevant to the surrounding section.
- Do not rename, modify, or remove [[IMAGE:N]] markers.
- Place each preserved [[IMAGE:N]] marker near the corresponding topic or explanation.
- Return the notes in Markdown format.

WEBPAGE CONTENT:

${notesContent}`;
};