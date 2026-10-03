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