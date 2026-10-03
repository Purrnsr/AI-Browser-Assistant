import { getRecentGmailMessages } from './gmail';
import type {
  GetEmailsRequest,
  GetEmailsResponse,
} from './messages';

export const handleGetEmailsMessage = async (
  message: GetEmailsRequest
): Promise<GetEmailsResponse> => {
  try {
    const emails = await getRecentGmailMessages(
      message.maxResults ?? 10
    );

    return {
      success: true,
      emails,
    };
  } catch (error) {
    console.error('[Email Assistant] Failed to retrieve emails:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to retrieve emails.',
    };
  }
};