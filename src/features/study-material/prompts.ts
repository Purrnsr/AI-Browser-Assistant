export const buildStudyMaterialPrompt = (
  content: string
): string => {
  const MAX_STUDY_INPUT = 8000;
  const studyContent = content.slice(0, MAX_STUDY_INPUT);

  return `You are an AI study-material assistant.

Analyze the following webpage content and create clear, structured
study material for a student.

Follow this exact structure:

# Topic Summary
Give a concise summary of the main topic and what the learner
should understand from the content.

# Important Concepts
Identify the most important concepts from the content.
- Explain each concept briefly and clearly.
- Include important technical terms, names, numbers, or facts
  when they are present.

# Revision Material
Create concise revision notes covering the most important
information from the content.
- Use bullet points.
- Focus on information useful for exam or quick revision.
- Avoid unnecessary repetition.

# Questions and Answers
Create educational questions based only on the provided content.
- Generate 5 useful questions.
- Include a clear answer below each question.
- Prefer questions that test understanding rather than simple
  copying of sentences from the webpage.

Requirements:
- Use only information present in the provided content.
- Do not invent facts or add outside information.
- Use simple, student-friendly language.
- Keep the material concise but useful.
- Preserve important technical terms and facts.
- Return the result in Markdown format.

WEBPAGE CONTENT:

${studyContent}`;
};