export const buildEmailSummaryPrompt = (
  subject: string,
  sender: string,
  body: string
): string => {
  return `You are an email understanding assistant.

Analyze the following authorized email.

Email subject:
${subject}

Sender:
${sender}

Email body:
${body}

Provide a concise summary with these sections:

Purpose:
- Explain why the sender contacted the recipient.

Key Information:
- List the most important information from the email.

Requested Actions:
- Identify anything the recipient is asked or expected to do.
- If no action is requested, say "No specific action requested."

Important Details:
- Mention important dates, deadlines, amounts, names, or other details explicitly present in the email.

Rules:
- Use only information present in the email.
- Do not invent or assume missing information.
- Keep the response clear and easy to read.`;
};

export const buildEmailReplyPrompt = (
  subject: string,
  sender: string,
  body: string,
  userIntent: string,
  responseStyle: string
): string => {
  return `You are an email reply assistant.

Generate a draft reply to the following authorized email.

Original email subject:
${subject}

Original sender:
${sender}

Original email:
${body}

User's intended response:
${userIntent}

Preferred response style:
${responseStyle || 'Professional and polite'}

Instructions:
- Write only the suggested email reply.
- Follow the user's intended response.
- Use information from the original email when relevant.
- Do not invent facts, commitments, dates, or information.
- Keep the reply appropriate for the requested style.
- The reply is a draft suggestion and must be reviewed by the user before it is sent.`;
};
export const buildEmailActionItemsPrompt = (
  subject: string,
  sender: string,
  body: string
): string => {
  return `You are an email action-item and deadline extraction assistant.

Analyze the following authorized email and extract only information explicitly present or clearly determinable from the email.

Email subject:
${subject}

Sender:
${sender}

Email body:
${body}

Return ONLY valid JSON in exactly this structure:

{
  "actionItems": [
    {
      "task": "string",
      "responsibleParty": "string",
      "dueDate": "string"
    }
  ],
  "importantDates": [
    {
      "date": "string",
      "event": "string",
      "context": "string"
    }
  ],
  "deadlines": [
    {
      "deadline": "string",
      "relatedAction": "string"
    }
  ]
}

Extraction rules:

1. Action Items:
- Identify tasks or actions that someone is explicitly asked or expected to perform.
- Include the task itself.
- Identify the responsible party when the email clearly indicates who should perform it.
- If the responsible party cannot be determined, use "Not specified".
- If a due date for the action is not stated or clearly determinable, use an empty string.

2. Important Dates:
- Identify dates explicitly mentioned in the email that are relevant to meetings, events, appointments, submissions, schedules, or other important activities.
- Include the event associated with the date.
- Include brief context explaining why the date is important.
- Do not invent dates.

3. Deadlines:
- Identify explicit deadlines or clearly stated final dates for completing an action.
- Include the related action.
- If no deadline is present, return an empty array.

4. Date handling:
- Preserve dates exactly as stated when their meaning is clear.
- Do not infer a date that is not supported by the email.
- Do not convert relative dates such as "tomorrow" or "next Friday" into calendar dates unless the email provides enough information to determine the exact date.

5. Accuracy:
- Use only information contained in the email.
- Do not invent tasks, people, dates, deadlines, or events.
- If a category has no relevant information, return an empty array.
- Return valid JSON only.
- Do not include Markdown, code fences, explanations, or additional text outside the JSON.`;
};