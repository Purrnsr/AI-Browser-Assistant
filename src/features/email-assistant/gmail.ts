import { getGmailAuthToken } from './auth';

const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  body: string;
}

interface GmailMessageListResponse {
  messages?: Array<{
    id: string;
    threadId: string;
  }>;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: {
    data?: string;
  };
  parts?: GmailMessagePart[];
}

interface GmailMessageResponse {
  id: string;
  threadId: string;
  payload?: GmailMessagePart;
}

const decodeBase64Url = (data: string): string => {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');

  const binary = atob(base64);

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder('utf-8').decode(bytes);
};

const getHeaderValue = (
  headers: GmailHeader[] | undefined,
  name: string
): string => {
  return (
    headers?.find(
      (header) => header.name.toLowerCase() === name.toLowerCase()
    )?.value ?? ''
  );
};

const extractPlainText = (part: GmailMessagePart): string => {
  if (part.mimeType === 'text/plain' && part.body?.data) {
    return decodeBase64Url(part.body.data);
  }

  if (part.parts) {
    for (const childPart of part.parts) {
      const text = extractPlainText(childPart);

      if (text.trim()) {
        return text;
      }
    }
  }

  if (part.body?.data) {
    return decodeBase64Url(part.body.data);
  }

  return '';
};

export const getRecentGmailMessages = async (
  maxResults = 10
): Promise<GmailMessage[]> => {
  const token = await getGmailAuthToken();

  const listResponse = await fetch(
    `${GMAIL_API_URL}/messages?maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!listResponse.ok) {
    throw new Error(
      `Gmail request failed: ${listResponse.status} ${listResponse.statusText}`
    );
  }

  const listData =
    (await listResponse.json()) as GmailMessageListResponse;

  if (!listData.messages?.length) {
    return [];
  }

  const messages = await Promise.all(
    listData.messages.map(async ({ id }) => {
      const messageResponse = await fetch(
        `${GMAIL_API_URL}/messages/${id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!messageResponse.ok) {
        throw new Error(
          `Failed to read Gmail message: ${messageResponse.status} ${messageResponse.statusText}`
        );
      }

      const message =
        (await messageResponse.json()) as GmailMessageResponse;

      const headers = message.payload?.headers;

      return {
        id: message.id,
        threadId: message.threadId,
        subject: getHeaderValue(headers, 'Subject') || '(No subject)',
        sender: getHeaderValue(headers, 'From') || '(Unknown sender)',
        body: message.payload
          ? extractPlainText(message.payload)
          : '',
      };
    })
  );

  return messages;
};