export const getGmailAuthToken = async (): Promise<string> => {
  const result = await chrome.identity.getAuthToken({
    interactive: true,
  });

  if (!result.token) {
    throw new Error('Google authentication failed. No access token received.');
  }

  return result.token;
};